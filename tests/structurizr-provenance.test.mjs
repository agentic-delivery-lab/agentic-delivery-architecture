import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { runWithStableRuntime } from '../tools/lib/structurizr.mjs';

test('runtime provenance reports captured bytes and refuses changes during execution', async (t) => {
  const folder = await mkdtemp(path.join(os.tmpdir(), 'architecture-runtime-provenance-'));
  t.after(() => rm(folder, { recursive: true, force: true }));
  const runtime = path.join(folder, 'runtime.py');
  await writeFile(runtime, 'original source');
  const result = await runWithStableRuntime(runtime, async () => ({ stdout: 'result' }));
  assert.equal(result.runtimeSha256, createHash('sha256').update('original source').digest('hex'));
  assert.deepEqual(result.result, { stdout: 'result' });
  await assert.rejects(runWithStableRuntime(runtime, async () => {
    await writeFile(runtime, 'different source');
    return { stdout: 'result from original bytes' };
  }), /Runtime source changed during validation/);
});
