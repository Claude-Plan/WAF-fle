// @shieldlens/contracts
// Export frozen contracts and schemas

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const CONTRACTS_VERSION = readFileSync(join(__dirname, 'CONTRACTS_VERSION'), 'utf8').trim();

export const SCHEMAS = {
  rule: JSON.parse(readFileSync(join(__dirname, 'schemas/rule.schema.json'), 'utf8')),
  finding: JSON.parse(readFileSync(join(__dirname, 'schemas/finding.schema.json'), 'utf8')),
  patch: JSON.parse(readFileSync(join(__dirname, 'schemas/patch.schema.json'), 'utf8')),
  verification_summary: JSON.parse(readFileSync(join(__dirname, 'schemas/verification_summary.schema.json'), 'utf8')),
  signal: JSON.parse(readFileSync(join(__dirname, 'schemas/signal.schema.json'), 'utf8')),
  sse_events: JSON.parse(readFileSync(join(__dirname, 'schemas/sse_events.schema.json'), 'utf8')),
  explain_output: JSON.parse(readFileSync(join(__dirname, 'schemas/explain_output.schema.json'), 'utf8')),
  rule_draft_output: JSON.parse(readFileSync(join(__dirname, 'schemas/rule_draft_output.schema.json'), 'utf8')),
  route_profile: JSON.parse(readFileSync(join(__dirname, 'schemas/route_profile.schema.json'), 'utf8'))
};

export default {
  CONTRACTS_VERSION,
  SCHEMAS
};
