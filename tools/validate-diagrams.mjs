import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function requireIncludes(source, file, values, errors) {
  for (const value of values) if (!source.includes(value)) errors.push(`${file} is missing required source marker: ${value}`);
}

export async function validateDiagrams(root = repositoryRoot) {
  const errors = [];
  const modelPath = path.join(root, 'architecture/models/workspace.dsl');
  const model = await readFile(modelPath, 'utf8');
  requireIncludes(model, 'architecture/models/workspace.dsl', [
    'workspace ', 'model {', 'views {', 'Architecture Authority', 'Agentic Delivery Control Plane',
    'Agentic Primitives', 'Developer Distribution', 'Vercel webhook ingress', 'Neon replay store',
    'Codex CLI', 'Product repositories (unidentified)', 'delivers signed subscribed webhook',
    'claims delivery IDs and persists scan/replay state', 'starts the pinned CLI in the issue workspace',
  ], errors);

  const mermaidDirectory = path.join(root, 'architecture/diagrams/mermaid');
  const mermaidFiles = (await readdir(mermaidDirectory)).filter((file) => file.endsWith('.mmd')).sort();
  const requiredViews = new Map([
    ['strategic-alignment.mmd', ['Purpose', 'Mission', 'Vision', 'proposed strategic goals', 'AP-001 to AP-004', 'Accepted and proposed ADRs', 'Owner-context capabilities', 'Typed source Issues', 'Evaluation evidence']],
    ['context-map.mmd', ['Agentic Delivery Governance', 'Vercel webhook ingress', 'Neon PostgreSQL replay store', 'GitHub Actions', 'Codex CLI', 'Product repositories', 'No distinct product repository was identified.']],
    ['project-issue-lifecycle.mmd', ['Project-only card', 'planning input only', 'never an execution trigger', 'Agentic Delivery Control Plane', 'GitHub Actions', 'Pinned Codex CLI', 'Project progress projection']],
    ['factory-evolution-sequence.mmd', ['Failed evaluation or live observation', 'human triage and portfolio sequencing', 'source Issue', 'Reviewed decision by context steward', 'Pinned release and rollout', 'Post-change evaluation']],
    ['product-delivery-sequence.mmd', ['Product initiative', 'Requirements and acceptance criteria', 'Authorized repository bootstrap', 'explicit maintainer approval', 'Product outcome evaluation']],
    ['trust-boundaries.mmd', ['Canonical strategy and Architecture contracts', 'Untrusted Issue title', 'planning context only', 'GitHub App installation', 'Vercel ingress', 'Neon replay state', 'all deterministic gates pass', 'Human approval, merge, release, and activation']],
  ]);
  if (mermaidFiles.length < requiredViews.size) errors.push(`architecture/diagrams/mermaid must contain all ${requiredViews.size} required views`);
  for (const file of requiredViews.keys()) if (!mermaidFiles.includes(file)) errors.push(`architecture/diagrams/mermaid is missing required view ${file}`);
  for (const file of mermaidFiles) {
    const relative = `architecture/diagrams/mermaid/${file}`;
    const source = await readFile(path.join(mermaidDirectory, file), 'utf8');
    if (!/^(flowchart|sequenceDiagram|classDiagram|stateDiagram)/m.test(source)) errors.push(`${relative} must start with a supported Mermaid diagram declaration`);
    const markers = requiredViews.get(file) ?? (file === 'context-map.mmd'
      ? ['Architecture Authority', 'Agentic Delivery Control Plane', 'primary portfolio planning']
      : file === 'strategy-value-streams.mmd'
        ? ['Factory Evolution', 'Software Product Delivery', 'Agentic Delivery Control Plane', 'does not authorize']
        : file === 'project-issue-lifecycle.mmd'
          ? ['Project-only card', 'planning input only', 'never an execution trigger', 'Agentic Delivery Control Plane']
          : file === 'trust-boundaries.mmd'
            ? ['Human authority boundary', 'planning context only', 'deterministic gates pass', 'Independent Validator']
            : ['Agentic Delivery Control Plane']);
    requireIncludes(source, relative, markers, errors);
    if (file === 'issue-delivery-sequence.mmd') {
      requireIncludes(source, relative, ['Webhook delivery replay', 'Codex session continuation', 'Evaluation replay'], errors);
    }
  }

  const plantumlDirectory = path.join(root, 'architecture/diagrams/plantuml');
  const plantumlFiles = (await readdir(plantumlDirectory)).filter((file) => file.endsWith('.puml')).sort();
  for (const file of plantumlFiles) {
    const relative = `architecture/diagrams/plantuml/${file}`;
    const source = await readFile(path.join(plantumlDirectory, file), 'utf8');
    if (!source.startsWith('@startuml') || !source.trimEnd().endsWith('@enduml')) errors.push(`${relative} must have balanced PlantUML delimiters`);
    requireIncludes(source, relative, ['Architecture Authority', 'Agentic Delivery Control Plane'], errors);
  }

  const generatedDirectory = path.join(root, 'architecture/diagrams/generated');
  for (const file of await readdir(generatedDirectory)) {
    if (file !== 'README.md') errors.push(`generated diagram output must not be committed without an explicit release rule: ${file}`);
  }
  if (errors.length) throw new Error(`diagram validation failed:\n${errors.join('\n')}`);
  return { structurizr: 1, mermaid: mermaidFiles.length, requiredMermaid: requiredViews.size, plantuml: plantumlFiles.length };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const result = await validateDiagrams(process.argv[2] ?? repositoryRoot);
    process.stdout.write(`diagram validation passed: ${result.structurizr} Structurizr, ${result.mermaid} Mermaid, ${result.plantuml} PlantUML source(s).\n`);
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  }
}
