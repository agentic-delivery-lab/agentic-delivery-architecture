import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const chapters = [
  '01-introduction-and-goals.arc42.md',
  '02-architecture-constraints.arc42.md',
  '03-context-and-scope.arc42.md',
  '04-solution-strategy.arc42.md',
  '05-building-block-view.arc42.md',
  '06-runtime-view.arc42.md',
  '07-deployment-view.arc42.md',
  '08-cross-cutting-concepts.arc42.md',
  '09-architecture-decisions.arc42.md',
  '10-quality-requirements.arc42.md',
  '11-risks-and-technical-debt.arc42.md',
  '12-glossary.arc42.md',
];
const requiredCoverage = new Map([
  ['01-introduction-and-goals.arc42.md', ['Stakeholder', 'Concern', 'Viewpoint', 'View(s)', 'G-01', 'system-evidence.yml']],
  ['02-architecture-constraints.arc42.md', ['arc42.org/documentation', 'arc42.org/method', 'docs.arc42.org/examples', 'iso.org/standard/74393.html', 'TOGAF is not applied']],
  ['03-context-and-scope.arc42.md', ['agentic-delivery-governance', 'agentic-delivery-control-plane', 'agentic-primitives', 'developer-distribution', 'not a bounded context', '.github-private']],
  ['04-solution-strategy.arc42.md', ['Short gated loop', 'Long-running fan-out/fan-in', 'Continuous improvement loop', 'rollback']],
  ['05-building-block-view.arc42.md', ['Canonical owner', 'Agentic Primitives', 'Developer Distribution', 'GitHub App', 'decision-inventory.yml']],
  ['06-runtime-view.arc42.md', ['short gated loop', 'long-running fan-out/fan-in', 'continuous feedback', 'Issue-intake runs']],
  ['07-deployment-view.arc42.md', ['Intended deployment topology', 'Observed deployment snapshot', 'unknown', 'read:org']],
  ['08-cross-cutting-concepts.arc42.md', ['One owner', 'Work state and execution state', 'Semantic proposals and deterministic authorization', 'GitHub organization settings']],
  ['09-architecture-decisions.arc42.md', ['ADR-0001', 'ADR-0020', 'ADP-0001', 'ADD-0001', 'decision-inventory.yml', 'No external ADR text projection is']],
  ['10-quality-requirements.arc42.md', ['QR-001', 'QR-003', 'QR-004', 'QR-005', 'QR-007', 'QR-008', 'QR-010', 'QR-011', 'quality-scenarios.yml']],
  ['11-risks-and-technical-debt.arc42.md', ['risks.yml', 'technical-debt.yml', 'system-evidence.yml']],
  ['12-glossary.arc42.md', ['context-scoped terms', 'Agentic Delivery Governance', 'Agentic Delivery Control Plane', 'Agentic Primitives', 'Developer Distribution']],
]);

export async function validateArc42Structure(root = repositoryRoot) {
  const errors = [];
  for (const [index, chapter] of chapters.entries()) {
    const file = path.join(root, 'architecture', 'arc42', chapter);
    try {
      const source = await readFile(file, 'utf8');
      if (!source.startsWith(`# ${index + 1}.`)) errors.push(`${chapter} must start with the official section number`);
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
