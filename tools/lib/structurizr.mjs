import { createHash } from 'node:crypto';
import { execFile } from 'node:child_process';
import { open, readFile } from 'node:fs/promises';
import { constants } from 'node:fs';
import path from 'node:path';
import { promisify, isDeepStrictEqual } from 'node:util';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const execute = promisify(execFile);
const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');

function modelIndex(model) {
  const elements = new Map();
  const relationships = new Map();
  function visit(value) {
    if (!value || typeof value !== 'object') return;
    if (value.id && value.name) elements.set(value.id, value);
    if (value.id && value.sourceId && value.destinationId) relationships.set(value.id, value);
    Object.values(value).forEach((child) => Array.isArray(child) ? child.forEach(visit) : visit(child));
  }
  visit(model);
  return { elements, relationships };
}

export function selectView(workspace, key) {
  const views = Object.values(workspace.views).filter(Array.isArray).flat();
  const matches = views.filter((view) => view.key === key);
  if (matches.length !== 1) throw new Error(`Unknown or ambiguous Structurizr view key: ${key}`);
  const view = matches[0];
  const index = modelIndex(workspace.model);
  const elements = (view.elements ?? []).map(({ id }) => {
    if (!index.elements.has(id)) throw new Error(`View references missing model element: ${id}`);
    const element = index.elements.get(id);
    return Object.fromEntries(['id', 'name', 'description', 'technology', 'tags', 'url', 'properties']
      .filter((field) => element[field] !== undefined).map((field) => [field, element[field]]));
  });
  const ids = new Set(elements.map(({ id }) => id));
  const relationships = (view.relationships ?? []).map(({ id }) => {
    const relation = index.relationships.get(id);
    if (!relation || !ids.has(relation.sourceId) || !ids.has(relation.destinationId)) {
      throw new Error(`View relationship is missing or outside its model elements: ${id}`);
    }
    return relation;
  });
  return { key, elements, relationships };
}

export async function readModelInput(modelPath, limit) {
  if (!Number.isSafeInteger(limit) || limit < 1 || limit > 262_144) throw new Error('Invalid DSL input byte limit');
  if (process.platform !== 'linux' || process.arch !== 'x64') throw new Error('Model validation requires Linux x64');
  const absolute = path.resolve(modelPath);
  const parts = absolute.split(path.sep).filter(Boolean);
  let directory;
  let file;
  try {
    const directoryFlags = constants.O_RDONLY | constants.O_DIRECTORY | constants.O_NOFOLLOW;
    directory = await open(path.parse(absolute).root, directoryFlags);
    for (const part of parts.slice(0, -1)) {
      const next = await open(`/proc/self/fd/${directory.fd}/${part}`, directoryFlags);
      await directory.close();
      directory = next;
    }
    file = await open(`/proc/self/fd/${directory.fd}/${parts.at(-1)}`,
      constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK);
    const metadata = await file.stat();
    if (!metadata.isFile()) throw new Error('Model input must be a regular file without symbolic links');
    if (metadata.size > limit) throw new Error('DSL input exceeds the pinned byte limit');
    const chunks = [];
    let bytes = 0;
    for await (const chunk of file.createReadStream({ autoClose: false, highWaterMark: 65_536 })) {
      bytes += chunk.length;
      if (bytes > limit) throw new Error('DSL input exceeds the pinned byte limit');
      chunks.push(chunk);
    }
    return Buffer.concat(chunks);
  } catch (error) {
    if (['ELOOP', 'ENOTDIR', 'ENXIO', 'EISDIR'].includes(error.code)) {
      throw new Error('Model input must be a regular file without symbolic links', { cause: error });
    }
    throw error;
  } finally {
    await file?.close();
    await directory?.close();
  }
}

export async function modelInputDigest(modelPath, limit) {
  return sha256(await readModelInput(modelPath, limit));
}

export async function runWithStableRuntime(runtimePath, run) {
  const runtimeSha256 = sha256(await readFile(runtimePath));
  const result = await run();
  if (runtimeSha256 !== sha256(await readFile(runtimePath))) throw new Error('Runtime source changed during validation');
  return { result, runtimeSha256 };
}

export async function validateStructurizr(modelPath, viewKeys, toolingRoot = root) {
  const selectedRoot = path.resolve(toolingRoot);
  const lockBytes = await readFile(path.join(selectedRoot, 'architecture/references/tooling-lock.json'));
  const pin = JSON.parse(lockBytes).diagramRenderers.structurizr;
  const keys = viewKeys ?? pin.views;
  if (!Array.isArray(keys) || keys.length > pin.views.length || !keys.length || new Set(keys).size !== keys.length
    || keys.some((key) => !pin.views.includes(key))) throw new Error('Unapproved Structurizr view key');
  const before = await modelInputDigest(modelPath, pin.maxInputBytes);
  const runtimePath = path.join(selectedRoot, 'tools/structurizr/runtime.py');
  const { result: { stdout }, runtimeSha256 } = await runWithStableRuntime(runtimePath, () =>
    execute('python3', [runtimePath, modelPath], {
      timeout: 120_000, maxBuffer: pin.maxReportBytes, env: { PATH: '/usr/bin:/bin' },
    }));
  if (before !== await modelInputDigest(modelPath, pin.maxInputBytes)) throw new Error('Canonical DSL changed during validation');
  const report = JSON.parse(stdout);
  if (report.inputSha256 !== before || report.toolingLockSha256 !== sha256(lockBytes)) {
    throw new Error('Isolated request input/tooling snapshot differs from the declared hashes');
  }
  if (report.schemaVersion !== 1 || report.status !== 'parsed') {
    throw new Error(`Structurizr ${report.status ?? 'protocol-error'}: ${report.message ?? 'Invalid report'}`);
  }
  if (!isDeepStrictEqual(report.workspace.model, report.roundtrip.model)) {
    throw new Error('Structurizr JSON export/roundtrip changed the parsed model');
  }
  const selected = keys.map((key) => {
    if (!pin.views.includes(key)) throw new Error(`Unapproved Structurizr view key: ${key}`);
    const exported = selectView(report.workspace, key);
    if (!isDeepStrictEqual(exported, selectView(report.roundtrip, key))) throw new Error('Structurizr selected export changed on roundtrip');
    return exported;
  });
  return { inputSha256: before, version: pin.version, sdkVersion: pin.sdkVersion,
    archiveSha256: pin.archive.sha256, javaArchiveSha256: pin.java.sha256,
    adapterSha256: report.adapterSha256, toolingLockSha256: report.toolingLockSha256,
    runtimeAdapterSha256: runtimeSha256,
    libraries: pin.libraries, inspection: report.inspection, selectedViews: selected };
}
