import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { test } from 'node:test';
import { withoutDeclaredAmendments } from '../tools/decision-inventory.mjs';

const section = '### Operation-wide allowance amendment (W08)\n\nNew policy.\n\n';
const declaration = { heading: 'Operation-wide allowance amendment (W08)', sourceIssue: 'https://github.com/agentic-delivery-lab/agentic-delivery-architecture/issues/11', sha256: createHash('sha256').update(section).digest('hex') };
const original = '## More Information\n\n### Historical section\n\nOriginal source.\n';
const amended = original.replace('### Historical section', `${section}### Historical section`);

test('declared amendment preserves an exact imported baseline without copying policy prose', () => {
  assert.equal(withoutDeclaredAmendments(amended, [declaration]), original);
  assert.equal(withoutDeclaredAmendments(original, []), original);
});

test('missing, repeated, tampered or wrongly attributed amendments fail closed', () => {
  for (const [text, declarations] of [
    [original, [declaration]],
    [amended.replace('New policy.', 'Changed policy.'), [declaration]],
    [amended.replace(section, section + section), [declaration]],
    [amended, [declaration, declaration]],
    [amended, [{ ...declaration, sourceIssue: 'https://github.com/other/repo/issues/11' }]],
    [amended, [{ ...declaration, unexpected: true }]],
  ]) assert.throws(() => withoutDeclaredAmendments(text, declarations), /amendment/i);
});
