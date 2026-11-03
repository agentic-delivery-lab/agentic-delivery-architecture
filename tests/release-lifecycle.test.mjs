import assert from 'node:assert/strict';
import { test } from 'node:test';
import { existsSync } from 'node:fs';
import { cp, mkdir, mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { architectureContentDigest } from '../tools/architecture-content-digest.mjs';
import { validateArchitectureContracts } from '../tools/validate-architecture-contracts.mjs';
import { validateArchitectureRelease } from '../tools/validate-architecture-release.mjs';

const root = path.resolve(import.meta.dirname, '..');
const manifestPath = 'architecture/generated/architecture-release.json';

// Synthetic local Git fixtures exercise the real validators and digest binding.
// A valid lifecycle label is neither owner approval nor consumer admission.
test('release lifecycle validation preserves source integrity across declared states', async (t) => {
  const objects = execFileSync('git', ['-C', root, 'rev-parse', '--path-format=absolute', '--git-path', 'objects'], { encoding: 'utf8' }).trim();
  const scratch = await mkdtemp(path.join(tmpdir(), 'architecture-lifecycle-test-'));
  async function fixture(name, status) {
    const directory = path.join(scratch, name);
    await mkdir(directory);
    for (const entry of ['AGENTS.md', 'README.md', 'architecture', 'decisions']) {
      await cp(path.join(root, entry), path.join(directory, entry), { recursive: true });
    }
    if (existsSync(path.join(root, 'sources'))) await symlink(path.join(root, 'sources'), path.join(directory, 'sources'), 'dir');
    const git = (...args) => execFileSync('git', ['-C', directory, ...args], { encoding: 'utf8' }).trim();
    git('init', '-q', '--initial-branch=main');
    await writeFile(path.join(directory, '.git/objects/info/alternates'), `${objects}\n`);
    const file = path.join(directory, manifestPath);
    const release = JSON.parse(await readFile(file, 'utf8'));
    release.status = status;
    release.version = status === 'draft' ? '0.0.0-draft.lifecycle-fixture' : '0.0.0';
    await writeFile(file, `${JSON.stringify(release, null, 2)}\n`);
    release.contentSha256 = await architectureContentDigest(directory, 'WORKTREE');
    await writeFile(file, `${JSON.stringify(release, null, 2)}\n`);
    git('add', '--', 'AGENTS.md', 'README.md', 'architecture', 'decisions');
    git('-c', 'core.hooksPath=/dev/null', '-c', 'commit.gpgsign=false', '-c', 'user.name=Lifecycle fixture', '-c', 'user.email=lifecycle@example.invalid', 'commit', '-qm', 'Synthetic prepared lifecycle source');
    release.sourceCommit = git('rev-parse', 'HEAD');
    await writeFile(file, `${JSON.stringify(release, null, 2)}\n`);
    return { directory, file, release };
  }
  try {
    for (const status of ['draft', 'released', 'withdrawn']) {
      await t.test(`accepts integrity-bound ${status} metadata without an admission claim`, async () => {
        const candidate = await fixture(status, status);
        await validateArchitectureContracts(candidate.directory);
        const result = await validateArchitectureRelease(candidate.directory);
        assert.equal(result.status, status);
        assert.equal(result.sourceCommit, candidate.release.sourceCommit);
        assert.equal(result.contentSha256, candidate.release.contentSha256);
      });
    }
    await t.test('rejects missing, unknown and non-string lifecycle values', async () => {
      const candidate = await fixture('invalid', 'draft');
      for (const status of [undefined, null, 'approved', 1, { status: 'released' }]) {
        await writeFile(candidate.file, `${JSON.stringify({ ...candidate.release, status }, null, 2)}\n`);
        await assert.rejects(validateArchitectureContracts(candidate.directory), /lifecycle status|status draft/);
        await assert.rejects(validateArchitectureRelease(candidate.directory), /release status is invalid/);
      }
    });
    await t.test('a status-only promotion fails the unchanged source and digest checks', async () => {
      const candidate = await fixture('tampered', 'draft');
      await writeFile(candidate.file, `${JSON.stringify({ ...candidate.release, status: 'released' }, null, 2)}\n`);
      // The label is structurally valid, but changing it changes the authored tree.
      await validateArchitectureContracts(candidate.directory);
      await assert.rejects(validateArchitectureRelease(candidate.directory), /contentSha256 does not match/);
    });
  } finally {
    await rm(scratch, { recursive: true, force: true });
  }
});
