import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { parseRepositoryYaml } from './lib/yaml.mjs';

const ADR_FILE = /^(\d{4})-[a-z0-9-]+\.md$/;
const SHA1 = /^[0-9a-f]{40}$/;
const SHA256 = /^[0-9a-f]{64}$/;
const ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const KINDS = new Set(['agent', 'skill', 'instruction', 'hook', 'validator', 'capability', 'mcp-contract']);
const ENFORCEMENTS = new Set(['instructional', 'deterministic', 'semantic']);

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function frontmatter(source, file) {
  const lines = source.split(/\r?\n/);
  if (lines[0] !== '---') throw new Error(`${file} has no YAML frontmatter`);
  const closing = lines.findIndex((line, index) => index > 0 && line === '---');
  if (closing < 0) throw new Error(`${file} has no closing YAML frontmatter delimiter`);
  return parseRepositoryYaml(lines.slice(1, closing).join('\n'), `${file} frontmatter`);
}

function list(value) {
  return Array.isArray(value) ? value.map(String) : [];
}

async function loadAdrs(root) {
  const directory = path.join(root, 'decisions');
  const entries = await readdir(directory, { withFileTypes: true });
  const records = [];
  for (const entry of entries.filter((item) => item.isFile()).sort((a, b) => a.name.localeCompare(b.name))) {
    const match = ADR_FILE.exec(entry.name);
    if (!match) continue;
    const file = `decisions/${entry.name}`;
    const metadata = frontmatter(await readFile(path.join(directory, entry.name), 'utf8'), file);
    records.push({
      id: `ADR-${match[1]}`,
      file,
      domains: list(metadata.domains).sort(),
      requiredEnforcement: list(metadata['required-enforcement']).sort(),
      ...(list(metadata.supersedes).length ? { supersedes: list(metadata.supersedes).sort() } : {}),
    });
  }
  return records;
}

function validateLock(lock) {
  const errors = [];
  if (lock?.schemaVersion !== 1) errors.push('primitive catalog lock schemaVersion must be 1');
  if (lock?.source?.repository !== 'agentic-delivery-lab/agentic-delivery-primitives') errors.push('primitive catalog lock source repository is invalid');
  if (!SHA1.test(lock?.source?.sourceCommit ?? '')) errors.push('primitive catalog lock source commit must be an immutable SHA');
  if (lock?.architectureId !== 'urn:agentic-delivery:architecture:authority') errors.push('primitive catalog lock architectureId is invalid');
  if (!Array.isArray(lock?.primitives) || lock.primitives.length === 0) errors.push('primitive catalog lock must contain primitives');
  const ids = new Set();
  for (const [index, primitive] of (lock?.primitives ?? []).entries()) {
    const location = `primitives[${index}]`;
    if (!primitive || typeof primitive !== 'object' || Array.isArray(primitive)) { errors.push(`${location} must be an object`); continue; }
    if (!ID.test(primitive.id ?? '') || ids.has(primitive.id)) errors.push(`${location}.id must be unique kebab-case`);
    ids.add(primitive.id);
    if (!KINDS.has(primitive.kind)) errors.push(`${location}.kind is unsupported`);
    if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(primitive.version ?? '')) errors.push(`${location}.version must be SemVer`);
    if (typeof primitive.sourcePath !== 'string' || primitive.sourcePath.length === 0) errors.push(`${location}.sourcePath is required`);
    if (!ENFORCEMENTS.has(primitive.enforcement)) errors.push(`${location}.enforcement is unsupported`);
    for (const field of ['adrs', 'domains']) {
      if (!Array.isArray(primitive[field]) || primitive[field].length === 0 || primitive[field].some((item) => typeof item !== 'string')) errors.push(`${location}.${field} must be a non-empty string array`);
    }
  }
  if (errors.length) throw new Error(`primitive catalog lock validation failed:\n${errors.join('\n')}`);
}

export function validateOwnerProjection(projection) {
  const errors = [];
  const objectShape = (value, location, required, allowed) => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      errors.push(`${location} must be an object`);
      return false;
    }
    for (const key of required) if (!Object.hasOwn(value, key)) errors.push(`${location}.${key} is required`);
    for (const key of Object.keys(value)) if (!allowed.includes(key)) errors.push(`${location} contains unsupported property ${key}`);
    return true;
  };
  const rootIsObject = objectShape(projection, 'ADR owner projection', ['schemaVersion', 'purpose', 'owner', 'records'], ['schemaVersion', 'purpose', 'owner', 'records']);
  if (!rootIsObject) throw new Error(`ADR owner projection validation failed:\n${errors.join('\n')}`);
  if (projection.schemaVersion !== 1) errors.push('ADR owner projection schemaVersion must be 1');
  if (typeof projection.purpose !== 'string' || projection.purpose.trim().length === 0) errors.push('ADR owner projection purpose must be a non-empty string');
  const ownerIsObject = objectShape(projection.owner, 'ADR owner projection owner', ['repository', 'repositoryId', 'sourceCommit'], ['repository', 'repositoryId', 'sourceCommit']);
  if (ownerIsObject) {
    if (projection.owner.repository !== 'agentic-delivery-lab/agentic-delivery') errors.push('ADR owner projection repository is invalid');
    if (projection.owner.repositoryId !== 1358455028) errors.push('ADR owner projection repository ID is invalid');
    if (!SHA1.test(projection.owner.sourceCommit ?? '')) errors.push('ADR owner projection source commit must be an immutable lowercase SHA-1');
  }
  if (!Array.isArray(projection.records) || projection.records.length === 0) errors.push('ADR owner projection records must be a non-empty array');
  const ids = new Set();
  for (const [index, record] of (Array.isArray(projection.records) ? projection.records : []).entries()) {
    const location = `records[${index}]`;
    if (!objectShape(record, location, ['id', 'canonicalPath', 'sha256'], ['id', 'canonicalPath', 'sha256'])) continue;
    if (!/^ADR-[0-9]{4}$/.test(record.id ?? '') || ids.has(record.id)) errors.push(`${location}.id must be a unique ADR identifier`);
    ids.add(record.id);
    const expectedPrefix = typeof record.id === 'string' ? `docs/decisions/${record.id.slice(4)}-` : null;
    if (typeof record.canonicalPath !== 'string'
      || !/^docs\/decisions\/[0-9]{4}-[a-z0-9-]+\.md$/.test(record.canonicalPath)
      || !expectedPrefix
      || !record.canonicalPath.startsWith(expectedPrefix)) {
      errors.push(`${location}.canonicalPath must be the owning repository's canonical ADR path`);
    }
    if (!SHA256.test(record.sha256 ?? '')) errors.push(`${location}.sha256 must be a lowercase per-file SHA-256 digest`);
  }
  if (errors.length) throw new Error(`ADR owner projection validation failed:\n${errors.join('\n')}`);
  return new Map(projection.records.map((record) => [record.id, record]));
}

async function loadDomains(root) {
  const registry = parseRepositoryYaml(await readFile(path.join(root, 'architecture/domain/ubiquitous-language.yml'), 'utf8'), 'domain register');
  return (registry.bounded_contexts ?? []).map((context) => String(context.id)).sort();
}

async function buildIndex(root) {
  const lockPath = path.join(root, 'architecture', 'references', 'primitive-catalog.lock.yml');
  const ownerProjectionPath = path.join(root, 'architecture', 'references', 'adr-owner-projection.yml');
  const [adrs, lock, domains, ownerProjection] = await Promise.all([
    loadAdrs(root),
    readFile(lockPath, 'utf8').then((source) => parseRepositoryYaml(source, 'primitive catalog lock')),
    loadDomains(root),
    readFile(ownerProjectionPath, 'utf8').then((source) => parseRepositoryYaml(source, 'ADR owner projection')),
  ]);
  validateLock(lock);
  const externalOwners = validateOwnerProjection(ownerProjection);
  const adrById = new Map(adrs.map((adr) => [adr.id, adr]));
  const primitiveByAdr = new Map(adrs.map((adr) => [adr.id, []]));
  const externalIds = new Set(lock.primitives.flatMap((primitive) => primitive.adrs.filter((adr) => !adrById.has(adr))));
  for (const id of externalIds) if (!externalOwners.has(id)) throw new Error(`ADR owner projection has no immutable owner entry for ${id}`);
  for (const id of externalOwners.keys()) if (!externalIds.has(id)) throw new Error(`ADR owner projection contains unreferenced ADR ${id}`);
  const primitiveRows = lock.primitives.map((primitive) => {
    const adrsForPrimitive = [...primitive.adrs].sort();
    for (const adr of adrsForPrimitive) if (primitiveByAdr.has(adr)) primitiveByAdr.get(adr).push(primitive.id);
    return {
      id: primitive.id,
      kind: primitive.kind,
      version: primitive.version,
      sourceRepository: lock.source.repository,
      sourceCommit: lock.source.sourceCommit,
      sourcePath: primitive.sourcePath,
      enforcement: primitive.enforcement,
      adrs: adrsForPrimitive,
      localAdrs: adrsForPrimitive.filter((adr) => adrById.has(adr)),
      externalAdrs: adrsForPrimitive.filter((adr) => !adrById.has(adr)),
      domains: [...primitive.domains].sort(),
    };
  }).sort((left, right) => left.id.localeCompare(right.id));
  const adrRows = adrs.map((adr) => ({
    ...adr,
    primitives: [...(primitiveByAdr.get(adr.id) ?? [])].sort(),
  }));
  const externalAdrs = [...externalIds].sort().map((id) => {
    const record = externalOwners.get(id);
    return {
      id,
      owner: {
        repository: ownerProjection.owner.repository,
        repositoryId: ownerProjection.owner.repositoryId,
        sourceCommit: ownerProjection.owner.sourceCommit,
        canonicalPath: record.canonicalPath,
        sha256: record.sha256,
        url: `https://github.com/${ownerProjection.owner.repository}/blob/${ownerProjection.owner.sourceCommit}/${record.canonicalPath}`,
      },
    };
  });
  const uncoveredAdrs = adrRows.filter((adr) => adr.primitives.length === 0).map((adr) => adr.id);
  return {
    schemaVersion: 2,
    source: 'released-primitive-catalog',
    architecture: 'urn:agentic-delivery:architecture:authority',
    primitiveRelease: {
      repository: lock.source.repository,
      releaseId: lock.source.releaseId,
      version: lock.source.releaseVersion,
      sourceCommit: lock.source.sourceCommit,
      contentSha256: lock.source.contentSha256 ?? null,
      status: lock.source.status,
    },
    domains,
    adrs: adrRows,
    externalAdrs,
    uncoveredAdrs,
    primitives: primitiveRows,
  };
}

export async function generateAdrPrimitiveIndex({ checkOnly = false, root = repositoryRoot } = {}) {
  const resolvedRoot = path.resolve(root);
  const outputPath = path.join(resolvedRoot, 'architecture', 'generated', 'adr-primitive-index.json');
  const index = await buildIndex(resolvedRoot);
  if (checkOnly) {
    let current;
    try { current = JSON.parse(await readFile(outputPath, 'utf8')); } catch { current = null; }
    if (JSON.stringify(current) !== JSON.stringify(index)) {
      throw new Error('ADR/Primitive index check: generated index is stale.');
    }
    return index;
  } else {
    await writeFile(outputPath, `${JSON.stringify(index, null, 2)}\n`);
    return index;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2);
    const checkOnly = args.includes('--check');
    const root = args.find((argument) => argument !== '--check') ?? repositoryRoot;
    const index = await generateAdrPrimitiveIndex({ checkOnly, root });
    process.stdout.write(checkOnly
      ? `ADR/Primitive index v2 check passed: ${index.adrs.length} Architecture ADR(s), ${index.externalAdrs.length} externally owned ADR(s), ${index.primitives.length} primitive reference(s).\n`
      : `ADR/Primitive index v2 generated: ${index.adrs.length} Architecture ADR(s), ${index.externalAdrs.length} externally owned ADR(s), ${index.primitives.length} primitive reference(s).\n`);
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  }
}
