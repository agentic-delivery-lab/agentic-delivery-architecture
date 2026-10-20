import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { requirePreparedSourceAncestor } from '../tools/validate-architecture-release.mjs';

test('an available but non-ancestral prepared commit is not a durable release source', async () => {
  const directory = await mkdtemp(path.join(tmpdir(), 'release-ancestry-test-'));
  const git = (...args) => execFileSync('git', ['-C', directory, ...args], { encoding: 'utf8' }).trim();
  try {
    git('init', '-q', '--initial-branch=main');
    await writeFile(path.join(directory, 'baseline.txt'), 'same authored tree\n');
    git('add', '.');
    git('-c', 'core.hooksPath=/dev/null', '-c', 'commit.gpgsign=false', '-c', 'user.name=Release test', '-c', 'user.email=release-test@example.invalid', 'commit', '-qm', 'Prepared source');
    const reachable = git('rev-parse', 'HEAD');
    const tree = git('rev-parse', 'HEAD^{tree}');
    const orphan = git('-c', 'user.name=Release test', '-c', 'user.email=release-test@example.invalid', 'commit-tree', tree, '-m', 'Unretained prepared source');
    assert.equal(git('show', `${orphan}:baseline.txt`), 'same authored tree');
    await requirePreparedSourceAncestor(directory, reachable, 'HEAD');
    await assert.rejects(requirePreparedSourceAncestor(directory, orphan, 'HEAD'), /ancestor|reachable/);
  } finally { await rm(directory, { recursive: true, force: true }); }
});
