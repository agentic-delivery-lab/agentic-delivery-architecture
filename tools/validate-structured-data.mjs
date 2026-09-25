import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

import { parseRepositoryYaml } from './lib/yaml.mjs';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const JSON_SCHEMA_2020 = 'https://json-schema.org/draft/2020-12/schema';

export const architectureDataContracts = Object.freeze({
  'architecture/domain/bounded-contexts.yml': 'domain-bounded-contexts.schema.json',
  'architecture/domain/context-map.yml': 'domain-context-map.schema.json',
  'architecture/domain/ubiquitous-language.yml': 'domain-language.schema.json',
  'architecture/principles/index.yml': 'principle-index.schema.json',
  'architecture/quality/quality-scenarios.yml': 'quality-scenarios.schema.json',
  'architecture/risks/risks.yml': 'risk-register.schema.json',
  'architecture/risks/technical-debt.yml': 'technical-debt.schema.json',
  'architecture/policies/conformance.yml': 'conformance-policy.schema.json',
  'architecture/harness-review.yml': 'harness-review.schema.json',
  'architecture/references/decision-inventory.yml': 'decision-inventory.schema.json',
  'architecture/references/source-provenance.yml': 'source-provenance.schema.json',
  'architecture/references/primitive-catalog.lock.yml': 'primitive-catalog-lock.schema.json',
  'architecture/references/system-evidence.yml': 'system-evidence.schema.json',
  'architecture/references/tooling-lock.json': 'tooling-lock.schema.json',
  'architecture/references/adr-aliases.json': 'adr-aliases.schema.json',
  'architecture/generated/architecture-release.json': 'architecture-release.schema.json',
  'architecture/generated/adr-primitive-index.json': 'adr-primitive-index.schema.json',
});

function describeErrors(errors = []) {
  return errors.map((error) => `${error.instancePath || '/'} ${error.message}`).join('; ');
}

async function loadSchemas(root) {
  const contractsPath = path.join(root, 'architecture/contracts');
  const schemaFiles = (await readdir(contractsPath))
    .filter((name) => name.endsWith('.schema.json'))
    .sort();
  // The decision-inventory schema uses conditional `required` checks under
  // `not`, where Ajv cannot resolve sibling property declarations. Keep all
  // other strict checks enabled and enforce the full Draft 2020-12 meta-schema.
  const ajv = new Ajv2020({ allErrors: true, strict: true, strictRequired: false });
  addFormats(ajv);
  const validators = new Map();
  const schemaIds = new Set();

  for (const name of schemaFiles) {
    const relativePath = `architecture/contracts/${name}`;
    const schema = JSON.parse(await readFile(path.join(root, relativePath), 'utf8'));
    if (schema.$schema !== JSON_SCHEMA_2020) {
      throw new Error(`${relativePath} must declare JSON Schema Draft 2020-12`);
    }
    if (typeof schema.$id !== 'string' || schema.$id.trim() === '' || schemaIds.has(schema.$id)) {
      throw new Error(`${relativePath} must have a unique, non-empty $id`);
    }
    schemaIds.add(schema.$id);
    if (!ajv.validateSchema(schema)) {
      throw new Error(`${relativePath} is not a valid Draft 2020-12 schema: ${describeErrors(ajv.errors)}`);
    }
    try {
      validators.set(name, ajv.compile(schema));
    } catch (error) {
      throw new Error(`${relativePath} could not be compiled: ${error.message}`);
    }
  }
  return { schemaFiles, validators };
}

async function readData(root, relativePath) {
  const source = await readFile(path.join(root, relativePath), 'utf8');
  if (relativePath.endsWith('.json')) return JSON.parse(source);
  if (relativePath.endsWith('.yml') || relativePath.endsWith('.yaml')) {
    return parseRepositoryYaml(source, relativePath);
  }
  throw new Error(`${relativePath} must be YAML or JSON data`);
}

async function discoverArchitectureData(root, directory = 'architecture', results = []) {
  for (const entry of await readdir(path.join(root, directory), { withFileTypes: true })) {
    const relativePath = `${directory}/${entry.name}`;
    if (entry.isDirectory()) {
      if (relativePath !== 'architecture/contracts') {
        await discoverArchitectureData(root, relativePath, results);
      }
    } else if (/\.(?:json|ya?ml)$/.test(entry.name)) {
      results.push(relativePath);
    }
  }
  return results.sort();
}

export async function validateStructuredValue(root, relativePath, value) {
  const schemaName = architectureDataContracts[relativePath];
  if (!schemaName) throw new Error(`${relativePath} has no architecture data contract`);
  const { validators } = await loadSchemas(root);
  const validate = validators.get(schemaName);
  if (!validate) throw new Error(`missing schema architecture/contracts/${schemaName}`);
  if (!validate(value)) {
    throw new Error(`${relativePath} violates ${schemaName}: ${describeErrors(validate.errors)}`);
  }
  return true;
}

export async function validateStructuredData(root = repositoryRoot) {
  const { schemaFiles, validators } = await loadSchemas(root);
  const discoveredFiles = await discoverArchitectureData(root);
  const mappedFiles = Object.keys(architectureDataContracts).sort();
  if (JSON.stringify(discoveredFiles) !== JSON.stringify(mappedFiles)) {
    const missing = discoveredFiles.filter((file) => !mappedFiles.includes(file));
    const stale = mappedFiles.filter((file) => !discoveredFiles.includes(file));
    throw new Error(`Architecture structured-data coverage map is incomplete; unmapped=${missing.join(',') || 'none'}; missing=${stale.join(',') || 'none'}`);
  }
  for (const [relativePath, schemaName] of Object.entries(architectureDataContracts)) {
    const validate = validators.get(schemaName);
    if (!validate) throw new Error(`missing schema architecture/contracts/${schemaName} for ${relativePath}`);
    const value = await readData(root, relativePath);
    if (!validate(value)) {
      throw new Error(`${relativePath} violates ${schemaName}: ${describeErrors(validate.errors)}`);
    }
  }
  return { files: Object.keys(architectureDataContracts).length, schemas: schemaFiles.length };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const result = await validateStructuredData(process.argv[2] ?? repositoryRoot);
    process.stdout.write(`structured-data check passed: ${result.files} data files, ${result.schemas} Draft 2020-12 schemas.\n`);
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  }
}
