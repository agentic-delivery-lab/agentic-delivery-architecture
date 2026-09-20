import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SHA = /^[0-9a-f]{40}$/;
const SEMVER = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/;

export async function validateArchitectureRelease(root = repositoryRoot, expectedCommit = null) {
  const releasePath = path.join(root, 'architecture/generated/architecture-release.json');
  const release = JSON.parse(await readFile(releasePath, 'utf8'));
  const errors = [];
  if (release.schemaVersion !== 1) errors.push('architecture release schemaVersion must be 1');
  if (release.architectureId !== 'urn:agentic-delivery:architecture:authority') errors.push('architecture release id is invalid');
  if (!SEMVER.test(release.version ?? '')) errors.push('architecture release version must be SemVer');
  if (release.sourceRepository !== 'agentic-delivery-lab/agentic-delivery-architecture') errors.push('architecture release source repository must be Architecture Authority');
  if (!SHA.test(release.sourceCommit ?? '')) errors.push('architecture release sourceCommit must be immutable');
  if (!['draft', 'released', 'withdrawn'].includes(release.status)) errors.push('architecture release status is invalid');
  if (!Array.isArray(release.principleIds) || release.principleIds.length === 0) errors.push('architecture release must identify principles');
  if (typeof release.contractVersions !== 'object' || release.contractVersions === null) errors.push('architecture release contract versions are required');
  if (expectedCommit !== null && !SHA.test(expectedCommit)) errors.push('expected architecture commit must be immutable');
  if (errors.length) throw new Error(`architecture release validation failed:\n${errors.join('\n')}`);
  return { architectureId: release.architectureId, version: release.version, sourceCommit: release.sourceCommit, status: release.status };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const result = await validateArchitectureRelease(process.argv[2] ?? repositoryRoot, process.argv[3] ?? null);
    process.stdout.write(`architecture release is valid: ${result.version} (${result.sourceCommit}).\n`);
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  }
}
