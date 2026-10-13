import { createHash } from 'node:crypto';
import { execFile } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { parseRepositoryYaml } from './lib/yaml.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const exec = promisify(execFile);
const roots = ['AGENTS.md', 'README.md', 'requirements', 'contracts', 'manifests'];
const manifestPath = 'manifests/requirements-release.json';
const SHA = /^[0-9a-f]{40}$/;
const SHA256 = /^[0-9a-f]{64}$/;
const repository = 'agentic-delivery-lab/agentic-delivery-requirements';
const repositoryId = 1416207421;
const parse = (source) => parseRepositoryYaml(Buffer.from(source).toString('utf8'), 'pinned Requirements input');
const approvalPresent = value => value && typeof value.actor === 'string' && value.actor.trim()
  && /^https:\/\/github\.com\/[^/]+\/[^/]+\/pull\/[1-9][0-9]*$/.test(value.decisionReference ?? '')
  && /^\d{4}-\d{2}-\d{2}$/.test(value.approvedAt ?? '');

export function requirementsDigest(files) {
  const hash = createHash('sha256');
  let total = 0;
  for (const [file, source] of [...files.entries()].sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0)) {
    let data = Buffer.from(source);
    if (data.length > 1024 * 1024 || (total += data.length) > 16 * 1024 * 1024) throw new Error('Requirements input limit exceeded');
    if (file === manifestPath) {
      const manifest = JSON.parse(data.toString('utf8'));
      manifest.sourceCommit = null;
      manifest.contentSha256 = null;
      data = Buffer.from(JSON.stringify(manifest));
    }
    hash.update(file).update('\0').update(data).update('\0');
  }
  return hash.digest('hex');
}

export function buildQrProjection(lock, files) {
  if (lock.schemaVersion !== 1 || lock.repository !== repository || lock.repositoryId !== repositoryId
    || !SHA.test(lock.commit ?? '') || lock.manifestPath !== manifestPath || !SHA256.test(lock.contentSha256 ?? '')) throw new Error('Invalid immutable Requirements origin lock');
  if (!files.has(manifestPath)) throw new Error('Missing Requirements baseline manifest');
  const manifest = parse(files.get(manifestPath));
  if (manifest.schemaVersion !== 1 || manifest.requirementsId !== 'urn:agentic-delivery:requirements:authority'
    || manifest.sourceRepository !== repository || manifest.repositoryId !== repositoryId
    || manifest.status !== 'approved' || !approvalPresent(manifest.approval)
    || !SHA.test(manifest.sourceCommit ?? '') || manifest.version !== lock.version) throw new Error('Requirements baseline must be approved, attributable and origin/version bound');
  if (manifest.contentSha256 !== lock.contentSha256 || requirementsDigest(files) !== lock.contentSha256) throw new Error('Selected Requirements digest mismatch');
  if (!Array.isArray(manifest.catalogPaths) || !manifest.catalogPaths.includes('requirements/factory.yml')
    || manifest.catalogPaths.some(file => !/^requirements\/(?:factory\.yml|products\/[a-z][a-z0-9-]*\.yml)$/.test(file))) throw new Error('Invalid Requirements catalog paths');
  const paths = [...manifest.catalogPaths].sort();
  const actual = [...files.keys()].filter(file => file.startsWith('requirements/') && /\.ya?ml$/.test(file) && file !== 'requirements/scopes.yml').sort();
  if (JSON.stringify(paths) !== JSON.stringify(actual)) throw new Error('Incomplete Requirements catalog coverage');
  const records = paths.flatMap(file => {
    const catalog = parse(files.get(file));
    if (catalog.schemaVersion !== 1 || !Array.isArray(catalog.requirements)) throw new Error('Unsupported Requirements catalog');
    return catalog.requirements;
  });
  if (new Set(records.map(record => record.id)).size !== records.length) throw new Error('Duplicate Requirements identity');
  const approved = records.filter(record => record.status === 'approved');
  if (approved.some(record => !approvalPresent(record.approval))) throw new Error('Approved record lacks acceptance');
  if (JSON.stringify(approved.map(record => record.id).sort()) !== JSON.stringify(manifest.approvedRequirementIds)) throw new Error('Requirements approved-ID coverage mismatch');
  const qrs = records.filter(record => record.id.startsWith('QR-'));
  if (qrs.some(record => record.status !== 'approved') || !qrs.length
    || JSON.stringify(qrs.map(record => record.id).sort()) !== JSON.stringify(lock.qrIds)) throw new Error('QR projection must cover exactly the approved selected identities');
  const scenarios = qrs.map(record => {
    const q = record.qualityScenario;
    if (!q || record.statement !== q.response || record.verification?.criterion !== q.measure) throw new Error('QR projection does not match its normative statement/criterion');
    for (const field of ['name', 'stakeholder', 'concern', 'stimulus', 'response', 'measure', 'historicalStatus']) {
      if (typeof q[field] !== 'string' || !q[field].trim()) throw new Error(`Missing QR ${field}`);
    }
    if (!Array.isArray(q.historicalEvidence) || !q.historicalEvidence.every(value => typeof value === 'string')) throw new Error('Missing historical QR evidence');
    return { id: record.id, name: q.name, stakeholder: q.stakeholder, concern: q.concern, stimulus: q.stimulus,
      response: q.response, measure: q.measure, evidence: q.historicalEvidence, status: q.historicalStatus };
  });
  return { schemaVersion: 2, scenarios };
}

async function snapshot(sourceRoot, revision) {
  if (!SHA.test(revision)) throw new Error('Requirements revision must be immutable');
  const result = await exec('git', ['-C', sourceRoot, 'ls-tree', '-rz', '--name-only', revision], { maxBuffer: 32 * 1024 * 1024 });
  const paths = result.stdout.split('\0').filter(file => roots.some(entry => file === entry || file.startsWith(`${entry}/`)));
  const files = new Map();
  for (const file of paths) {
    const source = await exec('git', ['-C', sourceRoot, 'show', `${revision}:${file}`], { encoding: 'buffer', maxBuffer: 1024 * 1024 });
    files.set(file, source.stdout);
  }
  return files;
}

export async function validateRequirementsProjection(directory = root, { write = false } = {}) {
  const lock = JSON.parse(await readFile(path.join(directory, 'architecture/references/requirements.lock.json'), 'utf8'));
  const sourceRoot = process.env.AGENTIC_SOURCE_ROOT_REQUIREMENTS ?? path.join(directory, 'sources/requirements');
  const files = await snapshot(sourceRoot, lock.commit);
  const projected = buildQrProjection(lock, files);
  const manifest = parse(files.get(manifestPath));
  if (requirementsDigest(await snapshot(sourceRoot, manifest.sourceCommit)) !== lock.contentSha256) throw new Error('Requirements prepared-source digest mismatch');
  const generated = `# Generated projection; normative owner: Requirements Authority. Do not edit.\n# Source: ${lock.repository}@${lock.commit}; baseline ${lock.version}; sha256 ${lock.contentSha256}\n# Status/evidence strings retain historical origin; approval is not live satisfaction.\n` + JSON.stringify(projected, null, 2) + '\n';
  const file = path.join(directory, 'architecture/quality/quality-scenarios.yml');
  if (write) await writeFile(file, generated);
  else if (await readFile(file, 'utf8') !== generated) throw new Error('QR projection is stale or locally edited; regenerate from the selected Requirements baseline');
  return { normativeOwner: repository, qrScenarios: projected.scenarios.length, sourceCommit: lock.commit, contentSha256: lock.contentSha256 };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    if (process.argv.slice(2).some(arg => arg !== '--write')) throw new Error('Usage: node tools/validate-requirements-projection.mjs [--write]');
    console.log(JSON.stringify(await validateRequirementsProjection(root, { write: process.argv.includes('--write') })));
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
