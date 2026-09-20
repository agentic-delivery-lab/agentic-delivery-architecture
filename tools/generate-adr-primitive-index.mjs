import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { parseRepositoryYaml } from './lib/yaml.mjs';

const ADR_FILE = /^(\d{4})-[a-z0-9-]+\.md$/;
const SHA1 = /^[0-9a-f]{40}$/i;
const ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const KINDS = new Set(['agent', 'skill', 'instruction', 'hook', 'validator', 'capability', 'mcp-contract']);
const ENFORCEMENTS = new Set(['instructional', 'deterministic', 'semantic']);

const root = path.resolve(process.argv.slice(2).find((argument) => argument !== '--check') ?? path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'));
const check = process.argv.includes('--check');
const outputPath = path.join(root, 'architecture', 'generated', 'adr-primitive-index.json');
const lockPath = path.join(root, 'architecture', 'references', 'primitive-catalog.lock.yml');

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

async function loadAdrs() {
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

async function loadDomains() {
  const registry = parseRepositoryYaml(await readFile(path.join(root, 'architecture/domain/ubiquitous-language.yml'), 'utf8'), 'domain register');
  return (registry.bounded_contexts ?? []).map((context) => String(context.id)).sort();
}

async function buildIndex() {
  const [adrs, lock, domains] = await Promise.all([
    loadAdrs(),
    readFile(lockPath, 'utf8').then((source) => parseRepositoryYaml(source, 'primitive catalog lock')),
    loadDomains(),
  ]);
  validateLock(lock);
  const adrById = new Map(adrs.map((adr) => [adr.id, adr]));
  const primitiveByAdr = new Map(adrs.map((adr) => [adr.id, []]));
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
      domains: [...primitive.domains].sort(),
    };
  }).sort((left, right) => left.id.localeCompare(right.id));
  const adrRows = adrs.map((adr) => ({
    ...adr,
    primitives: [...(primitiveByAdr.get(adr.id) ?? [])].sort(),
  }));
  const externalAdrs = [...new Set(primitiveRows.flatMap((primitive) => primitive.adrs.filter((adr) => !adrById.has(adr))))].sort();
  const uncoveredAdrs = adrRows.filter((adr) => adr.primitives.length === 0).map((adr) => adr.id);
  return {
    schemaVersion: 1,
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

const index = await buildIndex();
if (check) {
  let current;
  try { current = JSON.parse(await readFile(outputPath, 'utf8')); } catch { current = null; }
  if (JSON.stringify(current) !== JSON.stringify(index)) {
    process.stderr.write('ADR/Primitive index check: generated index is stale.\n');
    process.exitCode = 1;
  } else {
    process.stdout.write(`ADR/Primitive index check passed: ${index.adrs.length} ADR(s), ${index.primitives.length} primitive reference(s).\n`);
  }
} else {
  await writeFile(outputPath, `${JSON.stringify(index, null, 2)}\n`);
  process.stdout.write(`ADR/Primitive index generated: ${index.adrs.length} ADR(s), ${index.primitives.length} primitive reference(s).\n`);
}
