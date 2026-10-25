import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { promisify } from 'node:util';
import { parseRepositoryYaml } from '../tools/lib/yaml.mjs';

const root = path.resolve(import.meta.dirname, '..');
const sourceRoot = process.env.AGENTIC_SOURCE_ROOT_PRIMITIVES ?? path.join(root, 'sources/primitives');
const manifestCommit = '69beab027d8b28fc082fa6054f4def5ba0146e3c';

test('the actual immutable Customizations source reproduces its manifest digest and projected catalog', async () => {
  const { readPrimitiveCatalogSource, projectPrimitiveCatalog } = await import('../tools/primitive-catalog-source.mjs');
  const source = await readPrimitiveCatalogSource({ sourceRoot, manifestCommit });
  assert.equal(source.manifestCommit, manifestCommit);
  assert.equal(source.manifest.sourceCommit, 'e26d3ac872aa1efbf1d567917f1de043895ef4cc');
  assert.equal(source.manifest.contentSha256, '4b6c07deb6f7be8f495244e3c50a528054528db1fdec5a5a14ea4cfdda5bb34e');
  assert.equal(source.catalog.primitives.length, 16);
  const projected = projectPrimitiveCatalog(source);
  const lock = parseRepositoryYaml(await readFile(path.join(root, 'architecture/references/primitive-catalog.lock.yml'), 'utf8'), 'selected Primitive catalog');
  assert.deepEqual(lock, projected, 'The selected lock must contain exactly the actual pinned source projection');
});

test('source reads reject moving refs and unavailable immutable commits', async () => {
  const { readPrimitiveCatalogSource } = await import('../tools/primitive-catalog-source.mjs');
  for (const revision of ['HEAD', 'main', `${manifestCommit}\n`, '0'.repeat(40)]) {
    await assert.rejects(readPrimitiveCatalogSource({ sourceRoot, manifestCommit: revision }));
  }
});

test('the generator CLI can load source verification and check the selected index', async () => {
  const { stdout } = await promisify(execFile)(process.execPath, ['tools/generate-adr-primitive-index.mjs', '--check'], {
    cwd: root, env: { ...process.env, AGENTIC_SOURCE_ROOT_PRIMITIVES: sourceRoot }, timeout: 120_000,
  });
  assert.match(stdout, /index v4 check passed/);
});

test('real Git fixtures hold on forged digests, unsupported tooling and nonancestral prepared sources', async (t) => {
  const { readPrimitiveCatalogSource } = await import('../tools/primitive-catalog-source.mjs');
  const exec = promisify(execFile);
  const env = { ...Object.fromEntries(Object.entries(process.env).filter(([key]) => !key.startsWith('GIT_'))), GIT_TERMINAL_PROMPT: '0' };
  const tool = (await exec('git', ['--no-lazy-fetch', '--no-replace-objects', '-C', sourceRoot, 'show', `${manifestCommit}:tools/primitive-content-digest.mjs`], { env, encoding: 'utf8' })).stdout;
  const directory = await mkdtemp(path.join(tmpdir(), 'architecture-primitive-source-test-'));
  try {
    const git = async (...args) => (await exec('git', ['-C', directory, '-c', 'core.hooksPath=/dev/null', '-c', 'commit.gpgsign=false', ...args], { env, encoding: 'utf8' })).stdout.trim();
    await git('init', '--quiet');
    await git('config', 'user.name', 'Synthetic source test');
    await git('config', 'user.email', 'synthetic@example.invalid');
    await mkdir(path.join(directory, 'tools'));
    await mkdir(path.join(directory, 'manifests'));
    await writeFile(path.join(directory, 'tools/primitive-content-digest.mjs'), tool);
    const catalog = {
      schemaVersion: 1, architectureId: 'urn:agentic-delivery:architecture:authority',
      primitives: [{ id: 'synthetic-agent', kind: 'agent', version: '0.1.0', path: 'agents/synthetic.md', enforcement: 'instructional', adrs: ['ADR-0001'], domains: ['agentic-delivery-governance'] }],
    };
    await writeFile(path.join(directory, 'manifests/primitive-catalog.yml'), JSON.stringify(catalog));
    await git('add', 'tools', 'manifests');
    await git('commit', '--quiet', '-m', 'synthetic prepared source');
    const prepared = await git('rev-parse', 'HEAD');
    const digest = (await exec(process.execPath, [path.join(directory, 'tools/primitive-content-digest.mjs'), directory, prepared], { env, encoding: 'utf8' })).stdout.trim();
    const manifest = {
      schemaVersion: 1, releaseId: 'urn:agentic-delivery:primitive-release:0.1.0-synthetic.1',
      version: '0.1.0-synthetic.1', status: 'draft', architecture: { id: catalog.architectureId },
      sourceCommit: prepared, contentSha256: digest,
    };
    const commitManifest = async (value, message) => {
      await writeFile(path.join(directory, 'manifests/primitive-release.json'), JSON.stringify(value));
      await git('add', 'manifests/primitive-release.json');
      await git('commit', '--quiet', '-m', message);
      return git('rev-parse', 'HEAD');
    };
    const valid = await commitManifest(manifest, 'synthetic valid manifest');
    const read = (revision) => readPrimitiveCatalogSource({ sourceRoot: directory, manifestCommit: revision });
    assert.equal((await read(valid)).manifest.contentSha256, digest, 'The real fixture is valid before testing negative variants');

    await t.test('a well-formed forged manifest digest fails actual reproduction', async () => {
      const wrong = await commitManifest({ ...manifest, contentSha256: '0'.repeat(64) }, 'synthetic forged digest');
      await assert.rejects(read(wrong), /digest does not match/);
    });
    await t.test('available orphan prepared objects are insufficient', async () => {
      const tree = await git('rev-parse', `${prepared}^{tree}`);
      const orphan = await git('commit-tree', tree, '-m', 'synthetic orphan source');
      const wrong = await commitManifest({ ...manifest, sourceCommit: orphan }, 'synthetic orphan pin');
      await assert.rejects(read(wrong), /merge-base/);
    });
    await t.test('tag objects are not manifest commit objects', async () => {
      await git('tag', '-a', 'synthetic-tag', valid, '-m', 'synthetic annotated tag');
      const tagObject = await git('rev-parse', 'synthetic-tag');
      await assert.rejects(read(tagObject), /commit object/);
    });
    await t.test('a replaced digest implementation is rejected before execution', async () => {
      await writeFile(path.join(directory, 'tools/primitive-content-digest.mjs'), 'throw new Error("synthetic tool must never execute");\n');
      await git('add', 'tools/primitive-content-digest.mjs');
      await git('commit', '--quiet', '-m', 'synthetic unrecognized tooling');
      const wrong = await commitManifest(manifest, 'synthetic tool manifest');
      await assert.rejects(read(wrong), /Unsupported Primitive digest implementation/);
    });
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
