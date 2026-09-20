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
  requireIncludes(model, 'architecture/models/workspace.dsl', ['workspace ', 'model {', 'views {', 'Architecture Authority', 'Agentic Delivery Control Plane', 'Agentic Primitives', 'Developer Distribution'], errors);

  const mermaidDirectory = path.join(root, 'architecture/diagrams/mermaid');
  const mermaidFiles = (await readdir(mermaidDirectory)).filter((file) => file.endsWith('.mmd')).sort();
  if (mermaidFiles.length < 2) errors.push('architecture/diagrams/mermaid must contain at least two source views');
  for (const file of mermaidFiles) {
    const relative = `architecture/diagrams/mermaid/${file}`;
    const source = await readFile(path.join(mermaidDirectory, file), 'utf8');
    if (!/^(flowchart|sequenceDiagram|classDiagram|stateDiagram)/m.test(source)) errors.push(`${relative} must start with a supported Mermaid diagram declaration`);
    const markers = file.includes('context')
      ? ['Architecture Authority', 'Agentic Delivery Control Plane']
      : ['Agentic Delivery Control Plane'];
    requireIncludes(source, relative, markers, errors);
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
  return { structurizr: 1, mermaid: mermaidFiles.length, plantuml: plantumlFiles.length };
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
