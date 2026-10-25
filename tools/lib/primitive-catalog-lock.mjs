const SHA1 = /^[0-9a-f]{40}$/;
const ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const KINDS = new Set(['agent', 'skill', 'instruction', 'hook', 'validator', 'capability', 'mcp-contract']);
const ENFORCEMENTS = new Set(['instructional', 'deterministic', 'semantic']);

export function validatePrimitiveCatalogLock(lock) {
  const errors = [];
  const record = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
  const closed = (value, fields) => record(value) && fields.every((key) => Object.hasOwn(value, key))
    && Object.keys(value).every((key) => fields.includes(key));
  if (!closed(lock, ['schemaVersion', 'source', 'architectureId', 'primitives'])) errors.push('primitive catalog lock must be a closed record');
  if (![1, 2].includes(lock?.schemaVersion)) errors.push('primitive catalog lock schemaVersion must be supported (1 or 2)');
  const source = record(lock?.source) ? lock.source : {};
  const fields = ['repository', 'releaseId', 'releaseVersion', 'sourceCommit', 'contentSha256', 'status'];
  if (lock?.schemaVersion === 2) fields.push('repositoryId');
  if (!closed(source, fields)) errors.push('primitive catalog source must use its closed versioned shape');
  const historical = lock?.schemaVersion === 1 && source.repository === 'agentic-delivery-lab/agentic-delivery-primitives'
    && !Object.hasOwn(source, 'repositoryId');
  const current = lock?.schemaVersion === 2 && source.repository === 'agentic-delivery-lab/agentic-delivery-agent-customizations'
    && source.repositoryId === 1380894656;
  if (!historical && !current) errors.push('primitive catalog source identity does not match its declared contract version');
  if (typeof source.sourceCommit !== 'string' || source.sourceCommit.length !== 40 || !SHA1.test(source.sourceCommit)) errors.push('primitive catalog lock source commit must be an immutable SHA');
  if (typeof source.contentSha256 !== 'string' || source.contentSha256.length !== 64 || !/^[0-9a-f]{64}$/u.test(source.contentSha256)) errors.push('primitive catalog source digest must be an immutable SHA-256 string');
  if (typeof source.releaseVersion !== 'string' || !/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/u.test(source.releaseVersion)
    || source.releaseId !== `urn:agentic-delivery:primitive-release:${source.releaseVersion}`) errors.push('primitive catalog release identity/version is invalid');
  if (!['draft', 'released', 'withdrawn'].includes(source.status)) errors.push('primitive catalog source status is unsupported');
  if (lock?.architectureId !== 'urn:agentic-delivery:architecture:authority') errors.push('primitive catalog lock architectureId is invalid');
  if (!Array.isArray(lock?.primitives) || lock.primitives.length === 0) errors.push('primitive catalog lock must contain primitives');
  const ids = new Set();
  for (const [index, primitive] of (Array.isArray(lock?.primitives) ? lock.primitives : []).entries()) {
    const location = `primitives[${index}]`;
    if (!primitive || typeof primitive !== 'object' || Array.isArray(primitive)) { errors.push(`${location} must be an object`); continue; }
    if (!closed(primitive, ['id', 'kind', 'version', 'sourcePath', 'enforcement', 'adrs', 'domains'])) errors.push(`${location} must be a closed primitive record`);
    if (typeof primitive.id !== 'string' || !ID.test(primitive.id) || ids.has(primitive.id)) errors.push(`${location}.id must be unique kebab-case`);
    ids.add(primitive.id);
    if (!KINDS.has(primitive.kind)) errors.push(`${location}.kind is unsupported`);
    if (typeof primitive.version !== 'string' || !/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(primitive.version)) errors.push(`${location}.version must be SemVer`);
    if (typeof primitive.sourcePath !== 'string' || primitive.sourcePath.length === 0) errors.push(`${location}.sourcePath is required`);
    if (!ENFORCEMENTS.has(primitive.enforcement)) errors.push(`${location}.enforcement is unsupported`);
    for (const field of ['adrs', 'domains']) {
      if (!Array.isArray(primitive[field]) || primitive[field].length === 0 || primitive[field].some((item) => typeof item !== 'string')) errors.push(`${location}.${field} must be a non-empty string array`);
    }
  }
  if (errors.length) throw new Error(`primitive catalog lock validation failed:\n${errors.join('\n')}`);
  return lock;
}
