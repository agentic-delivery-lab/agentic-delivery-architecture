import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SHA = /^[0-9a-f]{40}$/;

export function validateConformanceRequest(request, expectedArchitectureCommit = null) {
  const errors = [];
  if (!request || typeof request !== 'object' || Array.isArray(request)) errors.push('request must be an object');
  if (request?.schemaVersion !== 1) errors.push('request schemaVersion must be 1');
  if (!SHA.test(request?.architectureCommit ?? '')) errors.push('request architectureCommit must be immutable');
  if (!SHA.test(request?.implementationCommit ?? '')) errors.push('request implementationCommit must be immutable');
  if (!Array.isArray(request?.affectedIdentifiers) || request.affectedIdentifiers.length === 0 || request.affectedIdentifiers.some((id) => typeof id !== 'string' || id.length === 0)) errors.push('request affectedIdentifiers must be a non-empty string array');
  if (new Set(request?.affectedIdentifiers ?? []).size !== (request?.affectedIdentifiers ?? []).length) errors.push('request affectedIdentifiers must be unique');
  if (request?.architectureDigest !== undefined && !/^[0-9a-f]{64}$/.test(request.architectureDigest)) errors.push('request architectureDigest must be a SHA-256 digest');
  if (expectedArchitectureCommit !== null && request?.architectureCommit !== expectedArchitectureCommit) errors.push('request architectureCommit does not match the checked-out Architecture Authority');
  if (errors.length) throw new Error(`architecture conformance request validation failed:\n${errors.join('\n')}`);
  return { schemaVersion: 1, architectureCommit: request.architectureCommit, implementationCommit: request.implementationCommit, affectedIdentifiers: [...request.affectedIdentifiers] };
}

export async function validateConformanceRequestFile(filePath, expectedArchitectureCommit = null) {
  return validateConformanceRequest(JSON.parse(await readFile(filePath, 'utf8')), expectedArchitectureCommit);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const result = await validateConformanceRequestFile(process.argv[2], process.argv[3] ?? null);
    process.stdout.write(`architecture conformance request is valid for ${result.affectedIdentifiers.length} identifier(s).\n`);
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  }
}
