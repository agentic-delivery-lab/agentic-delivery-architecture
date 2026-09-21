import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

async function json(relativePath) {
  return JSON.parse(await readFile(path.join(repositoryRoot, relativePath), 'utf8'));
}

export async function validateArchitectureContracts(root = repositoryRoot) {
  const errors = [];
  const release = JSON.parse(await readFile(path.join(root, 'architecture/generated/architecture-release.json'), 'utf8'));
  if (release.schemaVersion !== 1 || release.status !== 'draft') errors.push('draft architecture release must use schemaVersion 1 and status draft');
  if (release.sourceRepository !== 'agentic-delivery-lab/agentic-delivery-architecture') errors.push('architecture release sourceRepository must identify Architecture Authority');
  if (!/^[0-9a-f]{40}$/.test(release.sourceCommit)) errors.push('architecture release sourceCommit must be immutable');
  if (!/^[0-9a-f]{64}$/.test(release.contentSha256 ?? '')) errors.push('architecture release contentSha256 must be a non-null SHA-256 digest');
  if (!Array.isArray(release.adrIds) || release.adrIds.length === 0) errors.push('architecture release must identify ADRs');
  if (!Array.isArray(release.contextIds) || release.contextIds.length === 0) errors.push('architecture release must identify bounded contexts');
  for (const name of ['conformancePolicy', 'toolingLock']) {
    const reference = release[name];
    if (!reference || typeof reference.path !== 'string' || !/^[0-9a-f]{64}$/.test(reference.sha256 ?? '')) errors.push(`architecture release ${name} integrity reference is required`);
  }
  const aliases = JSON.parse(await readFile(path.join(root, 'architecture/references/adr-aliases.json'), 'utf8'));
  const aliasValues = Object.values(aliases.aliases ?? {});
  if (aliases.schemaVersion !== 1 || aliasValues.length === 0 || new Set(aliasValues).size !== aliasValues.length) errors.push('ADR aliases must be unique schemaVersion 1 records');
  const tooling = JSON.parse(await readFile(path.join(root, 'architecture/references/tooling-lock.json'), 'utf8'));
  if (tooling.schemaVersion !== 1 || tooling.status !== 'draft') errors.push('tooling lock must be schemaVersion 1 draft');
  if (tooling.arc42?.version !== '9.0') errors.push('arc42 tooling lock must pin the tested official version');
  if (tooling.arc42Language?.package !== '@doctc/arc42' || tooling.arc42Language?.version !== '0.24.0') errors.push('arc42-language tooling lock must pin @doctc/arc42 0.24.0');
  if (!/^sha512-[A-Za-z0-9+/=]+$/.test(tooling.arc42Language?.integrity ?? '')) errors.push('arc42-language tooling lock must include package integrity');
  if (!Array.isArray(tooling.arc42Language?.testedCommands) || !tooling.arc42Language.testedCommands.includes('validate')) errors.push('arc42-language tooling lock must record tested commands');
  const contexts = await readFile(path.join(root, 'architecture/domain/bounded-contexts.yml'), 'utf8');
  for (const required of ['architecture-authority', 'agentic-delivery-control-plane', 'agentic-primitives', 'developer-distribution']) {
    if (!contexts.includes(`id: ${required}`)) errors.push(`bounded-context register is missing ${required}`);
  }
  for (const file of [
    'architecture/contracts/architecture-release.schema.json',
    'architecture/contracts/adr-primitive-index.schema.json',
    'architecture/contracts/primitive-reference.schema.json',
    'architecture/contracts/conformance-request.schema.json',
    'architecture/contracts/conformance-result.schema.json',
  ]) {
    const schema = await json(file);
    if (schema.$schema !== 'https://json-schema.org/draft/2020-12/schema') errors.push(`${file} must use JSON Schema 2020-12`);
  }
  if (errors.length > 0) throw new Error(`architecture contract check failed:\n${errors.join('\n')}`);
  return { schemas: 5, aliases: aliasValues.length };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const result = await validateArchitectureContracts(process.argv[2] ?? repositoryRoot);
    process.stdout.write(`architecture contract check passed: ${result.schemas} schemas, ${result.aliases} ADR aliases.\n`);
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  }
}
