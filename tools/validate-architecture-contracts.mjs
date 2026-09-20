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
  if (!/^[0-9a-f]{40}$/.test(release.sourceCommit)) errors.push('architecture release sourceCommit must be immutable');
  const aliases = JSON.parse(await readFile(path.join(root, 'architecture/references/adr-aliases.json'), 'utf8'));
  const aliasValues = Object.values(aliases.aliases ?? {});
  if (aliases.schemaVersion !== 1 || aliasValues.length === 0 || new Set(aliasValues).size !== aliasValues.length) errors.push('ADR aliases must be unique schemaVersion 1 records');
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
