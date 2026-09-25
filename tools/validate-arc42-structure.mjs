import { access, readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const chapters = [
  '01-introduction-and-goals.md',
  '02-architecture-constraints.md',
  '03-context-and-scope.md',
  '04-solution-strategy.md',
  '05-building-block-view.md',
  '06-runtime-view.md',
  '07-deployment-view.md',
  '08-cross-cutting-concepts.md',
  '09-architecture-decisions.md',
  '10-quality-requirements.md',
  '11-risks-and-technical-debt.md',
  '12-glossary.md',
];
const requiredCoverage = new Map([
  ['01-introduction-and-goals.md', ['Stakeholder', 'Concern', 'Viewpoint', 'View(s)', 'G-01', 'system-evidence.yml']],
  ['02-architecture-constraints.md', ['arc42.org/documentation', 'arc42.org/method', 'github.com/arc42/examples.arc42.org-site', 'iso.org/standard/74393.html', 'TOGAF is not applied']],
  ['03-context-and-scope.md', ['agentic-delivery-governance', 'agentic-delivery-control-plane', 'agentic-primitives', 'developer-distribution', 'not a bounded context', '.github-private']],
  ['04-solution-strategy.md', ['Short gated loop', 'Long-running fan-out/fan-in', 'Continuous improvement loop', 'rollback']],
  ['05-building-block-view.md', ['Canonical owner', 'Agentic Primitives', 'Developer Distribution', 'GitHub App', 'decision-inventory.yml']],
  ['06-runtime-view.md', ['short gated loop', 'long-running fan-out/fan-in', 'continuous feedback', 'Issue-intake runs']],
  ['07-deployment-view.md', ['Intended deployment topology', 'Observed deployment snapshot', 'unknown', 'read:org']],
  ['08-cross-cutting-concepts.md', ['One owner', 'Work state and execution state', 'Semantic proposals and deterministic authorization', 'GitHub organization settings']],
  ['09-architecture-decisions.md', ['ADR-0001', 'ADR-0020', 'ADR-0021', 'ADP-0001', 'ADD-0001', 'decision-inventory.yml', 'No external ADR text projection is']],
  ['10-quality-requirements.md', ['QR-001', 'QR-003', 'QR-004', 'QR-005', 'QR-007', 'QR-008', 'QR-010', 'QR-011', 'quality-scenarios.yml']],
  ['11-risks-and-technical-debt.md', ['risks.yml', 'technical-debt.yml', 'system-evidence.yml']],
  ['12-glossary.md', ['context-scoped terms', 'Agentic Delivery Governance', 'Agentic Delivery Control Plane', 'Agentic Primitives', 'Developer Distribution']],
]);
const headings = [
  '# 1. Introduction and Goals',
  '# 2. Architecture Constraints',
  '# 3. Context and Scope',
  '# 4. Solution Strategy',
  '# 5. Building Block View',
  '# 6. Runtime View',
  '# 7. Deployment View',
  '# 8. Crosscutting Concepts',
  '# 9. Architecture Decisions',
  '# 10. Quality Requirements',
  '# 11. Risks and Technical Debt',
  '# 12. Glossary',
];

export async function validateArc42Structure(root = repositoryRoot) {
  const errors = [];
  const chapterDirectory = path.join(root, 'architecture', 'arc42');
  const actualFiles = (await readdir(chapterDirectory)).filter((file) => file.endsWith('.md') && file !== 'README.md').sort();
  if (actualFiles.some((file) => !/^\d{2}-[a-z0-9]+(?:-[a-z0-9]+)*\.md$/.test(file))) errors.push('arc42 chapter filenames must use NN-title.md lowercase kebab-case without a family suffix');
  if (JSON.stringify(actualFiles) !== JSON.stringify([...chapters].sort())) errors.push('arc42 chapter files must exactly match the twelve pinned chapter paths');
  for (const [index, chapter] of chapters.entries()) {
    const file = path.join(chapterDirectory, chapter);
    try {
      const source = await readFile(file, 'utf8');
      if (!source.startsWith(`${headings[index]}\n`)) errors.push(`${chapter} must start with the pinned official arc42 heading ${headings[index]}`);
      if (!source.includes(`arc42:section ${String(index + 1).padStart(2, '0')}`)) errors.push(`${chapter} is missing its arc42 section marker`);
      if (!source.includes('**Evidence:**')) errors.push(`${chapter} must identify the source basis and evidence boundary`);
      for (const required of requiredCoverage.get(chapter) ?? []) if (!source.includes(required)) errors.push(`${chapter} is missing required architecture coverage: ${required}`);
    } catch (error) {
      errors.push(`${chapter} cannot be read: ${error.message}`);
    }
  }
  const release = path.join(root, 'architecture', 'generated', 'architecture-release.json');
  try { await access(release); } catch (error) { errors.push(`architecture release is missing: ${error.message}`); }
  if (errors.length > 0) throw new Error(`arc42 structure check failed:\n${errors.join('\n')}`);
  return { chapters: chapters.length };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const result = await validateArc42Structure(process.argv[2] ?? repositoryRoot);
    process.stdout.write(`arc42 structure check passed: ${result.chapters} chapters.\n`);
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  }
}
