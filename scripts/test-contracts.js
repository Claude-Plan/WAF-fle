// scripts/test-contracts.js
// ShieldLens Contract Test Suite for Gate G0
// Validates:
// 1. OpenAPI syntax and structure
// 2. Required route coverage against §6 and Part 2B
// 3. Required JSON schemas presence and compilation with Ajv
// 4. API route registration and 501 NOT_IMPLEMENTED envelope
// 5. Core DDL structure and constraints
// 6. Contract version consistency (1.0)

import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { createApp } from '../apps/api/src/app.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const contractsDir = path.join(rootDir, 'packages', 'contracts');

let totalChecks = 0;
let passedChecks = 0;

function check(title, fn) {
  totalChecks++;
  try {
    fn();
    console.log(`  \x1b[32m✔\x1b[0m ${title}`);
    passedChecks++;
  } catch (err) {
    console.error(`  \x1b[31m✖\x1b[0m ${title}`);
    console.error(`    \x1b[31mError:\x1b[0m ${err.message}`);
    throw err;
  }
}

async function run() {
  console.log('\n\x1b[1m=== SHIELDLENS GATE G0 CONTRACT TEST SUITE ===\x1b[0m\n');

  // -------------------------------------------------------------
  // 1. CONTRACT VERSION CONSISTENCY
  // -------------------------------------------------------------
  console.log('\x1b[36m[1/5] Validating Contract Version Consistency...\x1b[0m');

  const versionFilePath = path.join(contractsDir, 'CONTRACTS_VERSION');
  check('CONTRACTS_VERSION file exists and contains "1.0"', () => {
    assert.ok(fs.existsSync(versionFilePath), 'CONTRACTS_VERSION must exist');
    const version = fs.readFileSync(versionFilePath, 'utf8').trim();
    assert.equal(version, '1.0', 'CONTRACTS_VERSION must be 1.0');
  });

  const contractsPkgPath = path.join(contractsDir, 'package.json');
  check('@shieldlens/contracts package.json version is 1.0.0', () => {
    assert.ok(fs.existsSync(contractsPkgPath), 'package.json must exist in packages/contracts');
    const pkg = JSON.parse(fs.readFileSync(contractsPkgPath, 'utf8'));
    assert.equal(pkg.version, '1.0.0', 'contracts package.json version must be 1.0.0');
  });

  // -------------------------------------------------------------
  // 2. CORE DDL PRESENCE AND STRUCTURE
  // -------------------------------------------------------------
  console.log('\n\x1b[36m[2/5] Validating Core Database DDL (§5.1 & §B·1)...\x1b[0m');

  const coreDdlPath = path.join(contractsDir, 'ddl', '001_core.sql');
  check('001_core.sql exists and contains all §5.1 tables and pgcrypto', () => {
    assert.ok(fs.existsSync(coreDdlPath), '001_core.sql must exist');
    const sql = fs.readFileSync(coreDdlPath, 'utf8');

    assert.ok(sql.includes('pgcrypto'), 'DDL must create extension pgcrypto');

    const expectedTables = [
      'targets',
      'scans',
      'findings',
      'triage_results',
      'patches',
      'verifications',
      'verification_cases',
      'traffic_corpus',
      'proxy_events',
      'intel_kev',
      'intel_epss',
      'benchmark_runs'
    ];

    for (const table of expectedTables) {
      const tableRegex = new RegExp(`create table\\s+${table}\\b`, 'i');
      assert.ok(tableRegex.test(sql), `DDL must create table "${table}"`);
    }

    assert.ok(sql.includes('create index on findings(target_id, status)'), 'findings index required');
    assert.ok(sql.includes('create index on proxy_events(target_id, ts desc)'), 'proxy_events index required');
    assert.ok(sql.includes('create index on traffic_corpus(target_id, label)'), 'traffic_corpus index required');
    assert.ok(sql.includes('create index on verification_cases(verification_id, suite)'), 'verification_cases index required');
  });

  const featureDdlPath = path.join(contractsDir, 'ddl', '002_feature_b.sql');
  check('002_feature_b.sql exists and defines route_profiles (§B·1)', () => {
    assert.ok(fs.existsSync(featureDdlPath), '002_feature_b.sql must exist');
    const sql = fs.readFileSync(featureDdlPath, 'utf8');
    assert.ok(/create table\s+route_profiles\b/i.test(sql), 'DDL must create table route_profiles');
    assert.ok(sql.includes('unique (target_id, method, route_template, location, name)'), 'Unique constraint required');
  });

  // -------------------------------------------------------------
  // 3. JSON SCHEMAS VALIDATION (AJV)
  // -------------------------------------------------------------
  console.log('\n\x1b[36m[3/5] Validating JSON Schemas with Ajv (§5.2, §7, §9, §B·4)...\x1b[0m');

  const ajv = new Ajv({ allErrors: true, strict: false });
  addFormats(ajv);

  const schemasDir = path.join(contractsDir, 'schemas');
  const expectedSchemas = [
    'rule.schema.json',
    'finding.schema.json',
    'patch.schema.json',
    'verification_summary.schema.json',
    'signal.schema.json',
    'sse_events.schema.json',
    'explain_output.schema.json',
    'rule_draft_output.schema.json',
    'route_profile.schema.json'
  ];

  const loadedSchemas = {};

  for (const schemaFile of expectedSchemas) {
    check(`Schema ${schemaFile} exists and parses as valid JSON`, () => {
      const p = path.join(schemasDir, schemaFile);
      assert.ok(fs.existsSync(p), `Missing schema file: ${schemaFile}`);
      const raw = fs.readFileSync(p, 'utf8');
      const parsed = JSON.parse(raw);
      loadedSchemas[schemaFile] = parsed;
    });
  }

  check('Compile all schemas into Ajv without error', () => {
    // Add rule schema first so rule_draft_output can reference it
    ajv.addSchema(loadedSchemas['rule.schema.json'], 'rule.schema.json');
    for (const [name, schema] of Object.entries(loadedSchemas)) {
      if (name !== 'rule.schema.json') {
        const validate = ajv.compile(schema);
        assert.ok(typeof validate === 'function', `Schema ${name} must compile to validator`);
      }
    }
  });

  check('Validate sample Rule object against rule.schema.json (§7)', () => {
    const validate = ajv.getSchema('rule.schema.json');
    const validRule = {
      schema_version: '1.0',
      id: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
      name: 'Test SQLi Rule',
      scope: {
        methods: ['GET'],
        path: { kind: 'template', value: '/rest/products/search' }
      },
      inspect: [{ location: 'query', name: 'q' }],
      normalize: ['url_decode_recursive', 'lowercase'],
      condition: { op: 'regex_match', value: "union.*select" },
      action: 'block',
      mode: 'shadow',
      meta: { source: 'deterministic' }
    };
    const valid = validate(validRule);
    assert.ok(valid, `Rule validation failed: ${JSON.stringify(validate.errors)}`);
  });

  check('Validate sample ExplainOutput object against explain_output.schema.json (§9.2)', () => {
    const validate = ajv.compile(loadedSchemas['explain_output.schema.json']);
    const sample = {
      summary: 'SQL injection vulnerability in product search parameter.',
      why_it_matters: 'Allows unauthenticated extraction of database credentials.',
      attacker_path: 'Attacker injects UNION SELECT query into q parameter.',
      recommended_action: 'Deploy positive regex parameter allowlist or block SQL keywords.',
      confidence: 'high'
    };
    const valid = validate(sample);
    assert.ok(valid, `ExplainOutput validation failed: ${JSON.stringify(validate.errors)}`);
  });

  // -------------------------------------------------------------
  // 4. OPENAPI SYNTAX AND ROUTE COVERAGE
  // -------------------------------------------------------------
  console.log('\n\x1b[36m[4/5] Validating OpenAPI Specification Coverage (§6 & §B·2)...\x1b[0m');

  const openApiPath = path.join(contractsDir, 'openapi.yaml');
  let openApiDoc;

  check('openapi.yaml exists and parses as valid YAML', () => {
    assert.ok(fs.existsSync(openApiPath), 'openapi.yaml must exist');
    const raw = fs.readFileSync(openApiPath, 'utf8');
    openApiDoc = YAML.parse(raw);
    assert.ok(openApiDoc.openapi, 'Must be valid OpenAPI document');
    assert.equal(openApiDoc.info.version, '1.0', 'OpenAPI version must be 1.0');
  });

  const requiredRoutes = [
    // §6.2 Public routes
    { method: 'get', path: '/health' },
    { method: 'get', path: '/llm/health' },
    { method: 'post', path: '/llm/selftest' },
    { method: 'post', path: '/targets' },
    { method: 'get', path: '/targets' },
    { method: 'get', path: '/targets/{id}' },
    { method: 'patch', path: '/targets/{id}' },
    { method: 'post', path: '/scans' },
    { method: 'post', path: '/scans/import' },
    { method: 'get', path: '/scans' },
    { method: 'get', path: '/scans/{id}' },
    { method: 'get', path: '/findings' },
    { method: 'get', path: '/findings/{id}' },
    { method: 'patch', path: '/findings/{id}' },
    { method: 'post', path: '/findings/{id}/confirm' },
    { method: 'post', path: '/triage/run' },
    { method: 'get', path: '/findings/{id}/triage' },
    { method: 'post', path: '/findings/{id}/triage/explain' },
    { method: 'get', path: '/findings/{id}/exposure' },
    { method: 'get', path: '/triage/compare' },
    { method: 'get', path: '/intel/status' },
    { method: 'get', path: '/intel/cve/{cve}' },
    { method: 'post', path: '/findings/{id}/patches' },
    { method: 'get', path: '/patches' },
    { method: 'get', path: '/patches/{id}' },
    { method: 'post', path: '/patches/{id}/verify' },
    { method: 'post', path: '/patches/{id}/deploy' },
    { method: 'post', path: '/patches/{id}/rollback' },
    { method: 'get', path: '/patches/{id}/export' },
    { method: 'get', path: '/patches/{id}/promotion' },
    { method: 'get', path: '/verifications/{id}' },
    { method: 'get', path: '/verifications/{id}/cases' },
    { method: 'get', path: '/events' },
    { method: 'get', path: '/events/stats' },
    { method: 'get', path: '/corpus/stats' },
    { method: 'get', path: '/benchmarks' },
    { method: 'post', path: '/benchmarks/run' },
    { method: 'get', path: '/benchmarks/{id}' },
    { method: 'get', path: '/stream' },
    // §B·2 Prototype B routes
    { method: 'post', path: '/profiles/rebuild' },
    { method: 'get', path: '/profiles' },
    { method: 'get', path: '/profiles/{id}' },
    { method: 'post', path: '/profiles/{id}/lock' },
    // §6.3 Internal routes
    { method: 'get', path: '/internal/v1/rules/active' },
    { method: 'get', path: '/internal/v1/rules/candidate/{patch_id}' },
    { method: 'post', path: '/internal/v1/events' },
    { method: 'post', path: '/internal/v1/corpus' },
    { method: 'get', path: '/internal/v1/profiles/active' }
  ];

  check(`OpenAPI specifies all ${requiredRoutes.length} frozen routes with 501 stubs`, () => {
    for (const route of requiredRoutes) {
      assert.ok(openApiDoc.paths[route.path], `OpenAPI missing path: ${route.path}`);
      assert.ok(
        openApiDoc.paths[route.path][route.method],
        `OpenAPI missing method: ${route.method.toUpperCase()} ${route.path}`
      );
    }
  });

  // -------------------------------------------------------------
  // 5. API ROUTE STUB RUNTIME VERIFICATION (501 NOT_IMPLEMENTED)
  // -------------------------------------------------------------
  console.log('\n\x1b[36m[5/5] Testing Express API Route Stubs (501 NOT_IMPLEMENTED)...\x1b[0m');

  const app = createApp();
  const server = http.createServer(app);

  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;

  function testEndpoint(method, urlPath) {
    return new Promise((resolve, reject) => {
      const req = http.request(
        {
          hostname: '127.0.0.1',
          port,
          path: urlPath,
          method,
          headers: {
            'Content-Type': 'application/json',
            'X-Internal-Token': 'test-token'
          }
        },
        (res) => {
          let data = '';
          res.on('data', (chunk) => (data += chunk));
          res.on('end', () => {
            try {
              assert.equal(
                res.statusCode,
                501,
                `Expected HTTP 501 for ${method} ${urlPath}, got ${res.statusCode}`
              );
              const body = JSON.parse(data);
              assert.ok(body.error, `Response for ${method} ${urlPath} must contain error object`);
              assert.equal(
                body.error.code,
                'NOT_IMPLEMENTED',
                `Error code must be NOT_IMPLEMENTED, got ${body.error.code}`
              );
              assert.ok(
                typeof body.error.message === 'string' && body.error.message.length > 0,
                'Error message must be non-empty string'
              );
              assert.ok(typeof body.error.details === 'object', 'Error details must be object');
              resolve();
            } catch (err) {
              reject(err);
            }
          });
        }
      );
      req.on('error', reject);
      if (method === 'POST' || method === 'PATCH') {
        req.write(JSON.stringify({ test: true }));
      }
      req.end();
    });
  }

  // Test every single endpoint mapped to real express routes
  const endpointsToTest = [
    // Public /api/v1 endpoints
    { method: 'GET', path: '/api/v1/health' },
    { method: 'GET', path: '/api/v1/llm/health' },
    { method: 'POST', path: '/api/v1/llm/selftest' },
    { method: 'POST', path: '/api/v1/targets' },
    { method: 'GET', path: '/api/v1/targets' },
    { method: 'GET', path: '/api/v1/targets/11111111-1111-1111-1111-111111111111' },
    { method: 'PATCH', path: '/api/v1/targets/11111111-1111-1111-1111-111111111111' },
    { method: 'POST', path: '/api/v1/scans' },
    { method: 'POST', path: '/api/v1/scans/import' },
    { method: 'GET', path: '/api/v1/scans' },
    { method: 'GET', path: '/api/v1/scans/11111111-1111-1111-1111-111111111111' },
    { method: 'GET', path: '/api/v1/findings' },
    { method: 'GET', path: '/api/v1/findings/11111111-1111-1111-1111-111111111111' },
    { method: 'PATCH', path: '/api/v1/findings/11111111-1111-1111-1111-111111111111' },
    { method: 'POST', path: '/api/v1/findings/11111111-1111-1111-1111-111111111111/confirm' },
    { method: 'POST', path: '/api/v1/triage/run' },
    { method: 'GET', path: '/api/v1/findings/11111111-1111-1111-1111-111111111111/triage' },
    { method: 'POST', path: '/api/v1/findings/11111111-1111-1111-1111-111111111111/triage/explain' },
    { method: 'GET', path: '/api/v1/findings/11111111-1111-1111-1111-111111111111/exposure' },
    { method: 'GET', path: '/api/v1/triage/compare?target_id=11111111-1111-1111-1111-111111111111' },
    { method: 'GET', path: '/api/v1/intel/status' },
    { method: 'GET', path: '/api/v1/intel/cve/CVE-2026-21876' },
    { method: 'POST', path: '/api/v1/findings/11111111-1111-1111-1111-111111111111/patches' },
    { method: 'GET', path: '/api/v1/patches' },
    { method: 'GET', path: '/api/v1/patches/11111111-1111-1111-1111-111111111111' },
    { method: 'POST', path: '/api/v1/patches/11111111-1111-1111-1111-111111111111/verify' },
    { method: 'POST', path: '/api/v1/patches/11111111-1111-1111-1111-111111111111/deploy' },
    { method: 'POST', path: '/api/v1/patches/11111111-1111-1111-1111-111111111111/rollback' },
    { method: 'GET', path: '/api/v1/patches/11111111-1111-1111-1111-111111111111/export' },
    { method: 'GET', path: '/api/v1/patches/11111111-1111-1111-1111-111111111111/promotion' },
    { method: 'GET', path: '/api/v1/verifications/11111111-1111-1111-1111-111111111111' },
    { method: 'GET', path: '/api/v1/verifications/11111111-1111-1111-1111-111111111111/cases' },
    { method: 'GET', path: '/api/v1/events' },
    { method: 'GET', path: '/api/v1/events/stats' },
    { method: 'GET', path: '/api/v1/corpus/stats' },
    { method: 'GET', path: '/api/v1/benchmarks' },
    { method: 'POST', path: '/api/v1/benchmarks/run' },
    { method: 'GET', path: '/api/v1/benchmarks/11111111-1111-1111-1111-111111111111' },
    { method: 'GET', path: '/api/v1/stream' },
    { method: 'POST', path: '/api/v1/profiles/rebuild' },
    { method: 'GET', path: '/api/v1/profiles' },
    { method: 'GET', path: '/api/v1/profiles/11111111-1111-1111-1111-111111111111' },
    { method: 'POST', path: '/api/v1/profiles/11111111-1111-1111-1111-111111111111/lock' },
    // Internal /internal/v1 routes
    { method: 'GET', path: '/internal/v1/rules/active?target_id=11111111-1111-1111-1111-111111111111' },
    { method: 'GET', path: '/internal/v1/rules/candidate/11111111-1111-1111-1111-111111111111' },
    { method: 'POST', path: '/internal/v1/events' },
    { method: 'POST', path: '/internal/v1/corpus' },
    { method: 'GET', path: '/internal/v1/profiles/active?target_id=11111111-1111-1111-1111-111111111111' }
  ];

  for (const ep of endpointsToTest) {
    await testEndpoint(ep.method, ep.path);
  }

  check(`All ${endpointsToTest.length} API route stubs return HTTP 501 and NOT_IMPLEMENTED envelope`, () => {
    assert.ok(true);
  });

  server.close();

  console.log('\n\x1b[32m====================================================\x1b[0m');
  console.log(`\x1b[32m✔ ALL ${passedChecks} OF ${totalChecks} CONTRACT CHECKS PASSED SUCCESSFULLY!\x1b[0m`);
  console.log('\x1b[32m====================================================\x1b[0m\n');
}

run().catch((err) => {
  console.error('\n\x1b[31mCONTRACT VALIDATION FAILED!\x1b[0m', err);
  process.exit(1);
});
