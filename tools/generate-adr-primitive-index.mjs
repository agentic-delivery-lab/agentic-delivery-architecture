import { createHash } from 'node:crypto';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { parseRepositoryYaml } from './lib/yaml.mjs';
import { validateDecisionInventory } from './decision-inventory.mjs';
import { validatePrimitiveCatalogLock } from './lib/primitive-catalog-lock.mjs';
export { validatePrimitiveCatalogLock } from './lib/primitive-catalog-lock.mjs';

const ADR_FILE = /^(\d{4})-[a-z0-9-]+\.md$/;

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


async function loadDomains(root) {
  const registry = parseRepositoryYaml(await readFile(path.join(root, 'architecture/domain/ubiquitous-language.yml'), 'utf8'), 'domain register');
  return (registry.bounded_contexts ?? []).map((context) => String(context.id)).sort();
}

async function buildIndex(root) {
  const lockPath = path.join(root, 'architecture', 'references', 'primitive-catalog.lock.yml');
  const inventoryPath = path.join(root, 'architecture', 'references', 'decision-inventory.yml');
  const [adrs, lock, domains, inventoryResult, inventorySource] = await Promise.all([
    loadAdrs(root),
    readFile(lockPath, 'utf8').then((source) => parseRepositoryYaml(source, 'primitive catalog lock')),
    loadDomains(root),
    validateDecisionInventory(root),
    readFile(inventoryPath),
  ]);
  validatePrimitiveCatalogLock(lock);
  if (lock.schemaVersion === 2) {
    const { assertPrimitiveCatalogProjection, readPrimitiveCatalogSource } = await import('./primitive-catalog-source.mjs');
    const sourceRoot = process.env.AGENTIC_SOURCE_ROOT_PRIMITIVES ?? path.join(root, 'sources/primitives');
    assertPrimitiveCatalogProjection(lock, await readPrimitiveCatalogSource({ sourceRoot, manifestCommit: lock.source.sourceCommit }));
  }
  const adrById = new Map(adrs.map((adr) => [adr.id, adr]));
  const primitiveByAdr = new Map(adrs.map((adr) => [adr.id, []]));
  for (const primitive of lock.primitives) {
    for (const id of primitive.adrs) if (!adrById.has(id)) throw new Error(`Primitive ADR reference ${id} has no canonical Architecture ADR record`);
  }
  const primitiveRows = lock.primitives.map((primitive) => {
    const adrsForPrimitive = [...primitive.adrs].sort();
    for (const adr of adrsForPrimitive) if (primitiveByAdr.has(adr)) primitiveByAdr.get(adr).push(primitive.id);
    return {
      id: primitive.id,
      kind: primitive.kind,
      version: primitive.version,
      sourceRepository: lock.source.repository,
      ...(lock.schemaVersion === 2 ? { sourceRepositoryId: lock.source.repositoryId } : {}),
      sourceCommit: lock.source.sourceCommit,
      sourcePath: primitive.sourcePath,
      enforcement: primitive.enforcement,
      adrs: adrsForPrimitive,
      localAdrs: adrsForPrimitive,
      externalAdrs: [],
      domains: [...primitive.domains].sort(),
    };
  }).sort((left, right) => left.id.localeCompare(right.id));
  const adrRows = adrs.map((adr) => ({
    ...adr,
    primitives: [...(primitiveByAdr.get(adr.id) ?? [])].sort(),
  }));
  const uncoveredAdrs = adrRows.filter((adr) => adr.primitives.length === 0).map((adr) => adr.id);
  return {
    schemaVersion: lock.schemaVersion === 2 ? 4 : 3,
    source: 'released-primitive-catalog',
    architecture: 'urn:agentic-delivery:architecture:authority',
    decisionInventory: {
      path: 'architecture/references/decision-inventory.yml',
      sha256: createHash('sha256').update(inventorySource).digest('hex'),
      schemaVersion: inventoryResult.inventory.schemaVersion,
    },
    primitiveRelease: {
      repository: lock.source.repository,
      ...(lock.schemaVersion === 2 ? { repositoryId: lock.source.repositoryId } : {}),
      releaseId: lock.source.releaseId,
      version: lock.source.releaseVersion,
      sourceCommit: lock.source.sourceCommit,
      contentSha256: lock.source.contentSha256 ?? null,
      status: lock.source.status,
    },
    domains,
    adrs: adrRows,
    externalAdrs: [],
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
      ? `ADR/Primitive index v${index.schemaVersion} check passed: ${index.adrs.length} canonical Architecture ADR(s), ${index.primitives.length} primitive reference(s).\n`
      : `ADR/Primitive index v${index.schemaVersion} generated: ${index.adrs.length} canonical Architecture ADR(s), ${index.primitives.length} primitive reference(s).\n`);
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  }
}
