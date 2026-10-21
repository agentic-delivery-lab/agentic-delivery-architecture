import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export function assertCustomizationsRepository(repository) {
  if (repository?.id !== 1380894656
    || repository.full_name !== 'agentic-delivery-lab/agentic-delivery-agent-customizations') {
    throw new Error('Customizations hosting identity must be repository ID 1380894656 at the explicit current name');
  }
  return { repositoryId: repository.id, repository: repository.full_name };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    if (process.argv.length !== 3) throw new Error('Usage: validate-customizations-identity.mjs <native-repository-response.json>');
    const identity = assertCustomizationsRepository(JSON.parse(await readFile(process.argv[2], 'utf8')));
    process.stdout.write(`Customizations hosting identity verified: ${identity.repositoryId} ${identity.repository}\n`);
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  }
}
