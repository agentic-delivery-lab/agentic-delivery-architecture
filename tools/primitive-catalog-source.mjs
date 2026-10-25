import { isDeepStrictEqual } from 'node:util';
import { createHash } from 'node:crypto';
import { execFile } from 'node:child_process';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import { parseRepositoryYaml } from './lib/yaml.mjs';
import { validatePrimitiveCatalogLock } from './lib/primitive-catalog-lock.mjs';

const repository = 'agentic-delivery-lab/agentic-delivery-agent-customizations';
const repositoryId = 1380894656;
const execFileAsync = promisify(execFile);
const immutableCommit = (value) => typeof value === 'string' && value.length === 40 && /^[0-9a-f]{40}$/u.test(value);
// Reviewed dependency-free digest implementation. An unrecognized replacement
// needs explicit tooling review, even if the source manifest names its digest.
const digestToolSha256 = 'b613051233cdec168343225acd7c815520086da54cca72f6f36d41ac951bd7c6';

export function projectPrimitiveCatalog(source) {
  const { manifest, catalog, manifestCommit } = source;
  if (source.repository !== repository || source.repositoryId !== repositoryId) throw new Error('Unrecognized current Customizations identity');
  if (manifest?.schemaVersion !== 1 || catalog?.schemaVersion !== 1) throw new Error('Unsupported Primitive manifest/catalog contract');
  if (!immutableCommit(manifestCommit) || !immutableCommit(manifest.sourceCommit)) throw new Error('Primitive manifest and prepared source commits must be immutable');
  if (manifest.architecture?.id !== catalog.architectureId) throw new Error('Primitive manifest/catalog Architecture identity mismatch');
  if (!Array.isArray(catalog.primitives)) throw new Error('Primitive catalog rows are required');
  const lock = {
    schemaVersion: 2,
    source: {
      repository, repositoryId, releaseId: manifest.releaseId,
      releaseVersion: manifest.version, sourceCommit: manifestCommit,
      contentSha256: manifest.contentSha256, status: manifest.status,
    },
    architectureId: catalog.architectureId,
    primitives: catalog.primitives.map((row) => ({
      id: row.id, kind: row.kind, version: row.version, sourcePath: row.path,
      enforcement: row.enforcement, adrs: structuredClone(row.adrs), domains: structuredClone(row.domains),
    })),
  };
  return validatePrimitiveCatalogLock(lock);
}

export function assertPrimitiveCatalogProjection(lock, source) {
  validatePrimitiveCatalogLock(lock);
  if (!isDeepStrictEqual(lock, projectPrimitiveCatalog(source))) throw new Error('Primitive catalog lock differs from its immutable source projection');
}

export async function readPrimitiveCatalogSource({ sourceRoot, manifestCommit }) {
  if (!sourceRoot || !immutableCommit(manifestCommit)) throw new Error('An explicit source checkout and immutable manifest commit are required');
  const env = {
    ...Object.fromEntries(Object.entries(process.env).filter(([key]) => !key.startsWith('GIT_'))),
    GIT_TERMINAL_PROMPT: '0', GIT_OPTIONAL_LOCKS: '0',
  };
  try {
    // Probe the required behavior rather than trusting a version string or
    // letting older Git silently ignore an unsupported environment variable.
    await execFileAsync('git', ['--no-lazy-fetch', '--no-replace-objects', 'version'], {
      env, encoding: 'utf8', timeout: 10_000, maxBuffer: 1024 * 1024,
    });
  } catch (cause) {
    throw new Error('Git prerequisite: current catalog generation requires --no-lazy-fetch and --no-replace-objects; install or upgrade to stock Git supporting both options before retrying. Offline source reads have not started.', { cause });
  }
  const git = async (...args) => (await execFileAsync('git', ['--no-lazy-fetch', '--no-replace-objects', '-C', sourceRoot, ...args], {
    encoding: 'utf8', env, timeout: 30_000, maxBuffer: 4 * 1024 * 1024,
  })).stdout;
  if ((await git('cat-file', '-t', manifestCommit)).trim() !== 'commit') throw new Error('Primitive manifest revision must identify a commit object');
  const manifest = JSON.parse(await git('show', `${manifestCommit}:manifests/primitive-release.json`));
  const catalog = parseRepositoryYaml(await git('show', `${manifestCommit}:manifests/primitive-catalog.yml`), 'immutable Primitive catalog');
  const source = { manifest, catalog, manifestCommit, repository, repositoryId };
  projectPrimitiveCatalog(source);
  if ((await git('cat-file', '-t', manifest.sourceCommit)).trim() !== 'commit') throw new Error('Primitive prepared source must identify a commit object');
  await git('merge-base', '--is-ancestor', manifest.sourceCommit, manifestCommit);
  const tool = await git('show', `${manifestCommit}:tools/primitive-content-digest.mjs`);
  if (createHash('sha256').update(tool).digest('hex') !== digestToolSha256) throw new Error('Unsupported Primitive digest implementation');
  let scratch;
  try {
    scratch = await mkdtemp(path.join(tmpdir(), 'architecture-primitive-digest-'));
    const script = path.join(scratch, 'primitive-content-digest.mjs');
    await writeFile(script, tool, { mode: 0o600 });
    for (const revision of new Set([manifestCommit, manifest.sourceCommit])) {
      const { stdout } = await execFileAsync(process.execPath, [script, path.resolve(sourceRoot), revision], {
        env: { ...env, GIT_NO_REPLACE_OBJECTS: '1', GIT_NO_LAZY_FETCH: '1' }, encoding: 'utf8', timeout: 120_000, maxBuffer: 1024 * 1024,
      });
      if (stdout.trim() !== manifest.contentSha256) throw new Error(`Primitive content digest does not match ${revision}`);
    }
  } finally {
    if (scratch) await rm(scratch, { recursive: true, force: true });
  }
  return source;
}
