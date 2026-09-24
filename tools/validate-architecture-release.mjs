import { createHash } from 'node:crypto';
import { execFile } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

import { architectureContentDigest } from './architecture-content-digest.mjs';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SHA = /^[0-9a-f]{40}$/;
const SHA256 = /^[0-9a-f]{64}$/;
const SEMVER = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/;
const execFileAsync = promisify(execFile);

async function gitShow(root, revision, relativePath) {
  return (await execFileAsync('git', ['-C', root, 'show', `${revision}:${relativePath}`], {
    encoding: 'buffer',
    windowsHide: true,
    maxBuffer: 8 * 1024 * 1024,
  })).stdout;
}

function pathIsSafe(relativePath) {
  return typeof relativePath === 'string'
    && relativePath.length > 0
    && !relativePath.startsWith('/')
    && !relativePath.split('/').includes('..');
}

function sha256(contents) {
  return createHash('sha256').update(contents).digest('hex');
}

export async function validateArchitectureRelease(root = repositoryRoot, expectedRevision = 'WORKTREE') {
  const releasePath = path.join(root, 'architecture/generated/architecture-release.json');
  const release = JSON.parse(await readFile(releasePath, 'utf8'));
  const errors = [];
  const revision = expectedRevision ?? 'WORKTREE';
  if (release.schemaVersion !== 1) errors.push('architecture release schemaVersion must be 1');
  if (release.architectureId !== 'urn:agentic-delivery:architecture:authority') errors.push('architecture release id is invalid');
  if (!SEMVER.test(release.version ?? '')) errors.push('architecture release version must be SemVer');
  if (release.sourceRepository !== 'agentic-delivery-lab/agentic-delivery-architecture') errors.push('architecture release source repository must be Architecture Authority');
  if (!SHA.test(release.sourceCommit ?? '')) errors.push('architecture release sourceCommit must be immutable');
  if (!SHA256.test(release.contentSha256 ?? '')) errors.push('architecture release contentSha256 must be a non-null SHA-256 digest');
  if (!['draft', 'released', 'withdrawn'].includes(release.status)) errors.push('architecture release status is invalid');
  if (!Array.isArray(release.principleIds) || release.principleIds.length === 0) errors.push('architecture release must identify principles');
  if (!Array.isArray(release.adrIds) || release.adrIds.length === 0 || new Set(release.adrIds).size !== release.adrIds.length) errors.push('architecture release must identify unique ADRs');
  if (!Array.isArray(release.contextIds) || release.contextIds.length === 0 || new Set(release.contextIds).size !== release.contextIds.length) errors.push('architecture release must identify unique bounded contexts');
  if (release.contractVersions?.adrPrimitiveIndex !== '2.0.0') errors.push('architecture release must pin ADR/Primitive index contract 2.0.0');
  for (const [name, reference] of [['conformancePolicy', release.conformancePolicy], ['toolingLock', release.toolingLock]]) {
    if (!reference || !pathIsSafe(reference.path) || !SHA256.test(reference.sha256 ?? '')) {
      errors.push(`architecture release ${name} must identify a safe path and SHA-256 digest`);
    }
  }
  if (typeof release.contractVersions !== 'object' || release.contractVersions === null) errors.push('architecture release contract versions are required');
  if (revision !== 'WORKTREE' && revision !== 'HEAD' && !SHA.test(revision)) errors.push('expected architecture revision must be WORKTREE, HEAD, or an immutable commit');
  if (errors.length === 0) {
    for (const sourceRevision of new Set([revision, release.sourceCommit])) {
      try {
        const digest = await architectureContentDigest(root, sourceRevision);
        if (digest !== release.contentSha256) errors.push(`architecture release contentSha256 does not match ${sourceRevision}: expected ${digest}, got ${release.contentSha256}`);
        for (const [name, reference] of [['conformancePolicy', release.conformancePolicy], ['toolingLock', release.toolingLock]]) {
          const contents = sourceRevision === 'WORKTREE'
            ? await readFile(path.join(root, reference.path))
            : await gitShow(root, sourceRevision, reference.path);
          const digestForPath = sha256(contents);
          if (digestForPath !== reference.sha256) errors.push(`architecture release ${name} digest does not match ${reference.path} at ${sourceRevision}`);
        }
      } catch (error) {
        errors.push(`architecture release integrity could not be reproduced at ${sourceRevision}: ${error.message}`);
      }
    }
  }
  if (errors.length) throw new Error(`architecture release validation failed:\n${errors.join('\n')}`);
  return {
    architectureId: release.architectureId,
    version: release.version,
    sourceCommit: release.sourceCommit,
    contentSha256: release.contentSha256,
    status: release.status,
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const result = await validateArchitectureRelease(process.argv[2] ?? repositoryRoot, process.argv[3] ?? 'WORKTREE');
    process.stdout.write(`architecture release is valid: ${result.version} (${result.sourceCommit}, ${result.contentSha256}).\n`);
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  }
}
