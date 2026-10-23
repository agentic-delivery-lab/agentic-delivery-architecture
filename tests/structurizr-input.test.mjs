import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdir, mkdtemp, readFile, rm, symlink, unlink, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { validateDiagrams } from '../tools/validate-diagrams.mjs';
import { modelInputDigest } from '../tools/lib/structurizr.mjs';

test('declared model reads reject file links, directory links and special files', async (t) => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'architecture-model-input-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(path.join(root, 'declared'));
  await mkdir(path.join(root, 'outside'));
  const file = path.join(root, 'declared/model.dsl');
  await writeFile(file, 'declared source');
  assert.equal(await modelInputDigest(file, 100), createHash('sha256').update('declared source').digest('hex'));
  await assert.rejects(modelInputDigest(file, 2), /byte limit/);
  await writeFile(path.join(root, 'outside/canary'), 'must never be read');
  await symlink(path.join(root, 'outside/canary'), path.join(root, 'declared/file-link'));
  await symlink(path.join(root, 'outside'), path.join(root, 'declared/directory-link'));
  execFileSync('mkfifo', [path.join(root, 'declared/pipe')]);
  for (const relative of ['file-link', 'directory-link/canary', 'pipe']) {
    await assert.rejects(modelInputDigest(path.join(root, 'declared', relative), 100), /regular file without symbolic links/);
  }
});

test('diagram entrypoint rejects redirected, special and oversized models before launching tooling', async (t) => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'architecture-diagram-input-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(path.join(root, 'architecture/models'), { recursive: true });
  await mkdir(path.join(root, 'architecture/references'), { recursive: true });
  const lock = await readFile(new URL('../architecture/references/tooling-lock.json', import.meta.url));
  await writeFile(path.join(root, 'architecture/references/tooling-lock.json'), lock);
  const canary = path.join(root, 'canary');
  const model = path.join(root, 'architecture/models/workspace.dsl');
  await writeFile(canary, 'must never be read');
  await symlink(canary, model);
  await assert.rejects(validateDiagrams(root), /regular file without symbolic links/);
  await unlink(model);
  execFileSync('mkfifo', [model]);
  await assert.rejects(validateDiagrams(root), /regular file without symbolic links/);
  await unlink(model);
  await writeFile(model, 'x'.repeat(262145));
  await assert.rejects(validateDiagrams(root), /byte limit/);
});
