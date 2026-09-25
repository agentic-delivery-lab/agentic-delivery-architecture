import { createHash } from 'node:crypto';
import { execFile } from 'node:child_process';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

import { parseRepositoryYaml } from './lib/yaml.mjs';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const execFileAsync = promisify(execFile);
const SHA1 = /^[0-9a-f]{40}$/;
const SHA256 = /^[0-9a-f]{64}$/;
const ARCH_REPOSITORY = 'agentic-delivery-lab/agentic-delivery-architecture';
const ARCH_REPOSITORY_ID = 1380894616;
const IMPORTED_IDS = ['ADR-0008', 'ADR-0009', 'ADR-0015', 'ADR-0017', 'ADP-0001', 'ADD-0001'];
const VARIANT_IDS = ['ADR-0012', 'ADR-0018', 'ADR-0019'];
const SOURCE_REPOSITORIES = {
  'agentic-delivery-lab/agentic-delivery': { key: 'control-plane', repositoryId: 1358455028, folder: 'agentic-delivery' },
  'agentic-delivery-lab/agentic-delivery-primitives': { key: 'primitives', repositoryId: 1380894656, folder: 'agentic-delivery-primitives' },
  'agentic-delivery-lab/agentic-delivery-distribution': { key: 'distribution', repositoryId: 1380894705, folder: 'agentic-delivery-distribution' },
};

function sha256(contents) {
  return createHash('sha256').update(contents).digest('hex');
}

function idForFilename(filename) {
  const adr = /^(\d{4})-[a-z0-9-]+\.md$/.exec(filename);
  if (adr) return `ADR-${adr[1]}`;
  const primitive = /^(ADP|ADD)-(\d{4})-[a-z0-9-]+\.md$/.exec(filename);
  return primitive ? `${primitive[1]}-${primitive[2]}` : null;
}

function frontmatter(source, label) {
  const lines = source.split(/\r?\n/);
  if (lines[0] !== '---') return null;
  const end = lines.findIndex((line, index) => index > 0 && line === '---');
  if (end < 0) throw new Error(`${label} has unclosed YAML frontmatter`);
  return parseRepositoryYaml(lines.slice(1, end).join('\n'), `${label} frontmatter`);
}

async function gitShow(root, revision, sourcePath) {
  return (await execFileAsync('git', ['-C', root, 'show', `${revision}:${sourcePath}`], {
    encoding: 'buffer',
    windowsHide: true,
    maxBuffer: 4 * 1024 * 1024,
  })).stdout;
}

async function sourceRepositoryRoot(root, repository) {
  const source = SOURCE_REPOSITORIES[repository];
  if (!source) throw new Error(`source repository ${repository} is not an approved decision origin`);
  const environmentKey = `AGENTIC_SOURCE_ROOT_${source.key.replaceAll('-', '_').toUpperCase()}`;
  const candidates = [
    process.env[environmentKey],
    path.join(root, 'sources', source.key),
    path.join(root, 'sources', source.folder),
    path.resolve(root, '..', source.folder),
  ].filter(Boolean);
  for (const candidate of candidates) {
    try {
      await execFileAsync('git', ['-C', candidate, 'rev-parse', '--show-toplevel'], { encoding: 'utf8', windowsHide: true });
      return candidate;
    } catch { /* Try the next documented checkout location. */ }
  }
  throw new Error(`source checkout for ${repository} is unavailable; set ${environmentKey} or provide sources/${source.key}`);
}

async function verifySourcePin(root, { repository, repositoryId, sourceCommit, sourcePath, sha256: expectedSha256 }, location) {
  if (repository === ARCH_REPOSITORY) {
    if (repositoryId !== ARCH_REPOSITORY_ID) throw new Error(`${location} has an invalid Architecture repository ID`);
  } else {
    const expected = SOURCE_REPOSITORIES[repository];
    if (!expected || repositoryId !== expected.repositoryId) throw new Error(`${location} repository ID does not match its repository slug`);
  }
  const sourceRoot = repository === ARCH_REPOSITORY ? root : await sourceRepositoryRoot(root, repository);
  const source = await gitShow(sourceRoot, sourceCommit, sourcePath);
  if (sha256(source) !== expectedSha256) throw new Error(`${location}.sha256 does not match git show ${sourceCommit}:${sourcePath}`);
  return source;
}

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function sameArray(left, right) {
  return Array.isArray(left) && Array.isArray(right)
    && [...left].sort().join('\n') === [...right].sort().join('\n');
}

function validateObjectShape(value, requiredKeys, allowedKeys, location, add) {
  if (!isObject(value)) return;
  for (const key of requiredKeys) if (!Object.hasOwn(value, key)) add(`${location}.${key} is required`);
  for (const key of Object.keys(value)) if (!allowedKeys.includes(key)) add(`${location} contains unsupported property ${key}`);
}

export async function validateDecisionInventory(root = repositoryRoot, { inventory: inventoryOverride } = {}) {
  const inventoryPath = path.join(root, 'architecture/references/decision-inventory.yml');
  const inventory = inventoryOverride ?? parseRepositoryYaml(await readFile(inventoryPath, 'utf8'), 'decision inventory');
  const errors = [];
  const add = (message) => errors.push(message);
  validateObjectShape(inventory, ['schemaVersion', 'purpose', 'sourceIssue', 'canonicalRepository', 'records', 'historicalVariants'],
    ['schemaVersion', 'purpose', 'sourceIssue', 'canonicalRepository', 'records', 'historicalVariants'], 'decision inventory', add);
  if (Object.hasOwn(inventory ?? {}, 'externalAdrs')) add('external ADR projections are forbidden in the canonical decision inventory');
  if (inventory?.schemaVersion !== 1) add('decision inventory schemaVersion must be 1');
  if (typeof inventory?.purpose !== 'string' || inventory.purpose.trim() === '') add('decision inventory purpose is required');
  if (inventory?.sourceIssue !== 'https://github.com/agentic-delivery-lab/agentic-delivery-architecture/issues/3') add('decision inventory sourceIssue must be Architecture issue #3');
  validateObjectShape(inventory?.canonicalRepository, ['repository', 'repositoryId'], ['repository', 'repositoryId'], 'decision inventory canonicalRepository', add);
  if (inventory?.canonicalRepository?.repository !== ARCH_REPOSITORY || inventory?.canonicalRepository?.repositoryId !== ARCH_REPOSITORY_ID) add('decision inventory canonical repository identity is invalid');
  if (!Array.isArray(inventory?.records) || inventory.records.length === 0) add('decision inventory records must be a non-empty array');

  const records = Array.isArray(inventory?.records) ? inventory.records : [];
  const recordById = new Map();
  const imported = [];
  const importedTransforms = [];
  for (const [index, record] of records.entries()) {
    const location = `decision inventory records[${index}]`;
    if (!isObject(record)) { add(`${location} must be an object`); continue; }
    validateObjectShape(record, ['id', 'path', 'domains', 'origin'], ['id', 'path', 'domains', 'origin'], location, add);
    const { id, path: recordPath, domains, origin } = record;
    if (!/^(ADR|ADP|ADD)-[0-9]{4}$/.test(id ?? '') || recordById.has(id)) add(`${location}.id must be a unique ADR, ADP, or ADD identifier`);
    else recordById.set(id, record);
    const filenameId = typeof recordPath === 'string' ? idForFilename(path.basename(recordPath)) : null;
    if (typeof recordPath !== 'string' || !recordPath.startsWith('decisions/') || recordPath.split('/').includes('..') || filenameId !== id) add(`${location}.path must be the canonical decisions file for ${id}`);
    if (!Array.isArray(domains) || domains.length === 0 || new Set(domains).size !== domains.length || domains.some((domain) => typeof domain !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(domain))) add(`${location}.domains must be unique bounded-context IDs`);
    if (!isObject(origin)) { add(`${location}.origin must be an object`); continue; }
    validateObjectShape(origin, ['type', 'repository', 'repositoryId'],
      ['type', 'repository', 'repositoryId', 'sourceCommit', 'sourcePath', 'sha256', 'reviewEvidence', 'sourceIssue', 'transformations'], `${location}.origin`, add);
    if (!['architecture-baseline', 'imported-text', 'proposed'].includes(origin.type)) add(`${location}.origin.type is unsupported`);
    if (typeof origin.repository !== 'string' || !/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(origin.repository)) add(`${location}.origin.repository is invalid`);
    if (!Number.isSafeInteger(origin.repositoryId) || origin.repositoryId < 1) add(`${location}.origin.repositoryId is invalid`);
    if (origin.type === 'proposed') {
      validateObjectShape(origin, ['type', 'repository', 'repositoryId', 'sourceIssue'], ['type', 'repository', 'repositoryId', 'sourceIssue'], `${location}.proposed origin`, add);
      if (origin.repository !== ARCH_REPOSITORY || origin.repositoryId !== ARCH_REPOSITORY_ID || origin.sourceIssue !== inventory.sourceIssue) add(`${location}.proposed origin must point to this Architecture proposal`);
      if (Object.hasOwn(origin, 'sourceCommit') || Object.hasOwn(origin, 'sourcePath') || Object.hasOwn(origin, 'sha256')) add(`${location}.proposed origin cannot claim a baseline source pin`);
    }
    if (origin.type !== 'proposed' && (!SHA1.test(origin.sourceCommit ?? '') || typeof origin.sourcePath !== 'string' || !/^((docs\/)?decisions)\/[^/]+\.md$/.test(origin.sourcePath) || !SHA256.test(origin.sha256 ?? ''))) add(`${location}.origin needs an immutable source commit, decision path, and SHA-256`);
    if (origin.type === 'architecture-baseline') {
      if (origin.repository !== ARCH_REPOSITORY || origin.repositoryId !== ARCH_REPOSITORY_ID || origin.sourcePath !== recordPath) add(`${location}.architecture baseline identity/path does not match canonical Architecture`);
      if (origin.reviewEvidence !== undefined && (typeof origin.reviewEvidence !== 'string' || !/^https:\/\/github\.com\/.+\/pull\/\d+$/.test(origin.reviewEvidence))) add(`${location}.origin.reviewEvidence must be a pull request URL`);
      if (SHA1.test(origin.sourceCommit ?? '') && typeof origin.sourcePath === 'string' && SHA256.test(origin.sha256 ?? '')) {
        try { await verifySourcePin(root, { ...origin }, `${location}.origin`); }
        catch (error) { add(`${location}.Architecture baseline source pin failed: ${error.message}`); }
      }
    }
    if (origin.type === 'imported-text') {
      if (Object.hasOwn(origin, 'reviewEvidence') || Object.hasOwn(origin, 'sourceIssue')) add(`${location}.imported origin cannot claim Architecture review evidence or a source issue`);
      if (origin.repository === ARCH_REPOSITORY || origin.repositoryId === ARCH_REPOSITORY_ID) add(`${location}.imported origin must identify a source repository other than Architecture`);
      imported.push(id);
      try {
        const source = await verifySourcePin(root, { ...origin }, `${location}.origin`);
        const sourceText = source.toString('utf8');
        const transformations = Array.isArray(origin.transformations) ? origin.transformations : [];
        let canonicalText = sourceText;
        for (const [transformIndex, transformation] of transformations.entries()) {
          const transformLocation = `${location}.origin.transformations[${transformIndex}]`;
          if (isObject(transformation)) validateObjectShape(transformation, ['from', 'to', 'reason'], ['from', 'to', 'reason'], transformLocation, add);
          if (!isObject(transformation) || typeof transformation.from !== 'string' || transformation.from.length === 0
            || typeof transformation.to !== 'string' || typeof transformation.reason !== 'string' || transformation.reason.trim() === '') {
            add(`${transformLocation} requires exact from/to text and an explanation`);
            continue;
          }
          const occurrences = canonicalText.split(transformation.from).length - 1;
          if (occurrences !== 1) add(`${transformLocation}.from must occur exactly once in the immutable source text`);
          else canonicalText = canonicalText.replace(transformation.from, transformation.to);
        }
        const currentText = await readFile(path.join(root, recordPath), 'utf8');
        if (currentText !== canonicalText) add(`${location}.canonical file must equal the immutable source text after only its declared link transformations`);
        importedTransforms.push(...transformations.map((transformation) => ({ id, ...transformation })));
      } catch (error) {
        add(`${location}.imported source verification failed: ${error.message}`);
      }
    }
    try {
      const source = await readFile(path.join(root, recordPath), 'utf8');
      const metadata = frontmatter(source, recordPath);
      if (id.startsWith('ADD-') && metadata === null) continue;
      if (metadata === null) add(`${location}.canonical decision requires frontmatter declaring its bounded-context scope`);
      else if (!sameArray(metadata.domains, domains)) add(`${location}.domains must match the record's bounded-context frontmatter`);
    } catch (error) {
      add(`${location}.canonical file cannot be read: ${error.message}`);
    }
  }

  if (!sameArray(imported.sort(), IMPORTED_IDS)) add('decision inventory must pin the six imported CP, Primitives, and Distribution records exactly');
  const recordsDirectory = path.join(root, 'decisions');
  const files = (await readdir(recordsDirectory, { withFileTypes: true }))
    .filter((entry) => entry.isFile() && idForFilename(entry.name))
    .map((entry) => ({ id: idForFilename(entry.name), path: `decisions/${entry.name}` }));
  if (files.length !== records.length || files.some(({ id, path: recordPath }) => recordById.get(id)?.path !== recordPath)) add('decision inventory IDs and paths must exactly match all local ADR, ADP, and ADD decision files');

  const variants = Array.isArray(inventory?.historicalVariants) ? inventory.historicalVariants : [];
  const variantIds = variants.map((variant) => variant?.id).sort();
  if (!sameArray(variantIds, VARIANT_IDS)) add('decision inventory must retain provenance for the three differing Control Plane variants ADR-0012, ADR-0018, and ADR-0019');
  const variantKeys = new Set();
  for (const [index, variant] of variants.entries()) {
    const location = `decision inventory historicalVariants[${index}]`;
    if (!isObject(variant)) { add(`${location} must be an object`); continue; }
    validateObjectShape(variant, ['id', 'repository', 'repositoryId', 'sourceCommit', 'sourcePath', 'sha256', 'disposition'],
      ['id', 'repository', 'repositoryId', 'sourceCommit', 'sourcePath', 'sha256', 'disposition'], location, add);
    if (!recordById.has(variant.id)) add(`${location}.id must resolve to a canonical decision`);
    if (variant.repository === ARCH_REPOSITORY || variant.repositoryId === ARCH_REPOSITORY_ID) add(`${location} must identify a non-canonical historical source`);
    if (!SHA1.test(variant.sourceCommit ?? '') || !/^docs\/decisions\/[0-9]{4}-[a-z0-9-]+\.md$/.test(variant.sourcePath ?? '') || !SHA256.test(variant.sha256 ?? '')) add(`${location} must pin an immutable source path and digest`);
    if (typeof variant.disposition !== 'string' || variant.disposition.trim() === '') add(`${location}.disposition must explain the source variant`);
    const key = `${variant.id}:${variant.repositoryId}:${variant.sourcePath}`;
    if (variantKeys.has(key)) add(`${location} duplicates a historical source identity`);
    variantKeys.add(key);
    try { await verifySourcePin(root, { ...variant }, location); }
    catch (error) { add(`${location} source verification failed: ${error.message}`); }
  }

  const [contextModel, evidence] = await Promise.all([
    readFile(path.join(root, 'architecture/domain/bounded-contexts.yml'), 'utf8').then((source) => parseRepositoryYaml(source, 'bounded-context register')),
    readFile(path.join(root, 'architecture/references/system-evidence.yml'), 'utf8').then((source) => parseRepositoryYaml(source, 'system evidence')),
  ]);
  const evidenceRepositories = new Map((evidence.repositories ?? []).map((repository) => [repository.id, repository]));
  const contexts = new Map((contextModel.contexts ?? []).map((context) => [context.id, context]));
  for (const record of records) {
    for (const contextId of record.domains ?? []) {
      const context = contexts.get(contextId);
      const route = context?.contextStewardRepository;
      const evidenceRepository = evidenceRepositories.get(route?.evidenceRepository);
      if (!route || !evidenceRepository || route.repository !== evidenceRepository.slug
        || route.repositoryId !== evidenceRepository.githubRepositoryId
        || !evidenceRepository.evidencePaths?.includes(route.evidencePath)
        || !SHA1.test(evidenceRepository.mainCommit ?? '')) {
        add(`decision ${record.id} cannot route semantic review for ${contextId} to a repository and source path in the pinned audit evidence`);
      }
    }
  }

  if (await readFile(path.join(root, 'architecture/references/adr-owner-projection.yml'), 'utf8').then(() => true).catch(() => false)) add('mutable or external ADR owner projection must be removed after canonical text centralization');
  if (errors.length) throw new Error(`decision inventory validation failed:\n${errors.join('\n')}`);
  return {
    inventory,
    recordById,
    decisionIds: records.map((record) => record.id),
    adrIds: records.filter((record) => record.id.startsWith('ADR-')).map((record) => record.id),
    importedTransforms,
    contextStewards: Object.fromEntries((contextModel.contexts ?? []).map((context) => [context.id, context.contextStewardRepository])),
  };
}

export { repositoryRoot as decisionInventoryRepositoryRoot };
