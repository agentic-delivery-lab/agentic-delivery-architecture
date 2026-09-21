import { createHash } from 'node:crypto';
import { execFile } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const SHA = /^[0-9a-f]{40}$/;

// These roots are the authoritative Architecture Authority content. Generated
// release metadata is deliberately included because the digest identifies the
// exact pinned tree, while migration and dependency caches remain outside the
// architecture view consumed by conformance review.
const AUTHORITATIVE_ROOTS = ['AGENTS.md', 'README.md', 'architecture', 'decisions'];

async function git(root, args, encoding = 'utf8') {
  const result = await execFileAsync('git', ['-C', root, ...args], {
    encoding,
    windowsHide: true,
    maxBuffer: 32 * 1024 * 1024,
  });
  return result.stdout;
}

export async function architectureFiles(root, revision = 'HEAD') {
  const output = await git(root, ['ls-tree', '-r', '--name-only', revision]);
  return output
    .split(/\r?\n/)
    .filter(Boolean)
    .filter((file) => AUTHORITATIVE_ROOTS.some((entry) => file === entry || file.startsWith(`${entry}/`)))
    .sort();
}

export async function architectureContentDigest(root, revision = 'HEAD') {
  if (!SHA.test(revision) && revision !== 'HEAD') throw new Error('architecture revision must be HEAD or a 40-character commit SHA');
  const files = await architectureFiles(root, revision);
  if (files.length === 0) throw new Error('Architecture Authority contains no authoritative files at the requested revision');
  const hash = createHash('sha256');
  for (const file of files) {
    const contents = await git(root, ['show', `${revision}:${file}`], 'buffer');
    hash.update(file, 'utf8');
    hash.update('\0', 'utf8');
    hash.update(contents);
    hash.update('\0', 'utf8');
  }
  return hash.digest('hex');
}

function usage() {
  return 'Usage: node tools/architecture-content-digest.mjs [repository-root] [commit-sha]';
}

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (process.argv.length > 4) {
    process.stderr.write(`${usage()}\n`);
    process.exitCode = 2;
  } else {
    try {
      process.stdout.write(`${await architectureContentDigest(process.argv[2] ?? repositoryRoot, process.argv[3] ?? 'HEAD')}\n`);
    } catch (error) {
      process.stderr.write(`${error.message}\n`);
      process.exitCode = 1;
    }
  }
}
