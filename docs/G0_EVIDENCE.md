# ShieldLens Gate G0 Evidence Report

**Document:** `docs/G0_EVIDENCE.md`  
**Gate:** G0 Contract Freeze (§11)  
**Timestamp:** 2026-11-17T12:05:00+05:30  
**Role:** Person 2 (P2) — Control Plane (R2) + Frontend (R4)  
**Contract Version:** `1.0`  

---

## 1. Repository & Branch Information
- **Repository Remote:** `https://github.com/Claude-Plan/WAF-fle.git`
- **Working Tree:** `C:\Users\akash\WAF-fle`
- **Active Branch:** `Person2/g0-contracts`
- **Base Commit:** `2cd1732` (*Initial commit*)
- **Target Integration Branch:** `integration` (per §2 N8)

---

## 2. Commit SHA & Tag
- **Commit SHA:** `569c28a3c1a0d7adba7002d7de4d01196b30b25a`
- **Commit Message:** `feat(contracts): complete Gate G0 contract freeze and API route stubs`
- **Git Tag:** `contracts-v1.0`
- **Tag Annotation:** `Release contracts v1.0 (Gate G0 freeze)`

---

## 3. Environment & Runtime
- **Node.js:** `v26.13.0` (compatible with Node 20 LTS ESM runtime §4)
- **npm:** `11.20.0`
- **Operating System:** Windows 11
- **Package Manager:** npm workspaces (`"workspaces": ["apps/*", "packages/*"]`)

---

## 4. Contract Package File Inventory (`packages/contracts/`)
```text
packages/contracts/
├── CONTRACTS_VERSION                       # Text file containing "1.0"
├── package.json                            # Package manifest (@shieldlens/contracts v1.0.0)
├── index.js                                # ESM exports for CONTRACTS_VERSION & SCHEMAS
├── openapi.yaml                            # Complete OpenAPI 3.0.3 specification (48 routes)
├── ddl/
│   ├── 001_core.sql                        # Core Supabase Postgres schema (§5.1)
│   └── 002_feature_b.sql                   # Adaptive Baseline schema (§B·1)
└── schemas/
    ├── rule.schema.json                    # Rule DSL schema (§7)
    ├── finding.schema.json                 # Finding schema (§5.1, §8.2)
    ├── patch.schema.json                   # Patch schema (§5.1, §8.4)
    ├── verification_summary.schema.json    # Verification summary schema (§5.2)
    ├── signal.schema.json                  # Triage signal schema (§5.2, §B·3)
    ├── sse_events.schema.json              # Server-Sent Events envelope schema (§6.4)
    ├── explain_output.schema.json          # Ollama explain output schema (§9.2)
    ├── rule_draft_output.schema.json       # LLM rule drafting candidate schema (§9.3)
    └── route_profile.schema.json           # Adaptive route profile schema (§B·4)
```

---

## 5. OpenAPI Route Coverage Checklist (§6 & §B·2)

All 48 routes defined across §6.2, §6.3, and Part 2B B·2 are specified in `packages/contracts/openapi.yaml`:

### Public Routes (§6.2 & §B·2)
- [x] `GET /health` — Subsystem health check (`db`, `ollama`, `proxy`, `target`)
- [x] `GET /llm/health` — Ollama reachability and active model
- [x] `POST /llm/selftest` — Ollama self-test suite (Gate G2 validation)
- [x] `POST /targets` — Create monitored target
- [x] `GET /targets` — List monitored targets
- [x] `GET /targets/{id}` — Fetch target details
- [x] `PATCH /targets/{id}` — Update target mode (`learn` / `protect`) or exposure
- [x] `POST /scans` — Launch security scan
- [x] `POST /scans/import` — Multipart import of ZAP JSON baseline
- [x] `GET /scans` — List scan history
- [x] `GET /scans/{id}` — Get scan details
- [x] `GET /findings` — List vulnerability findings (with embedded triage)
- [x] `GET /findings/{id}` — Get single finding with patches and triage
- [x] `PATCH /findings/{id}` — Update finding status (`open` / `dismissed`)
- [x] `POST /findings/{id}/confirm` — Run exploit oracle directly on target
- [x] `POST /triage/run` — Trigger triage scoring
- [x] `GET /findings/{id}/triage` — Fetch triage result
- [x] `POST /findings/{id}/triage/explain` — Re-run LLM triage explanation
- [x] `GET /findings/{id}/exposure` — Exposure metrics and coverage status (§B·2)
- [x] `GET /triage/compare` — Compare base-v1 vs exposure-v1 rankings (§B·2)
- [x] `GET /intel/status` — Threat intel counts (KEV & EPSS)
- [x] `GET /intel/cve/{cve}` — Threat intel lookup for specific CVE
- [x] `POST /findings/{id}/patches` — Generate virtual patch (`auto` / `deterministic` / `llm`)
- [x] `GET /patches` — List virtual patches
- [x] `GET /patches/{id}` — Fetch patch details + latest verification summary
- [x] `POST /patches/{id}/verify` — Launch patch verification suite
- [x] `POST /patches/{id}/deploy` — Deploy patch (`shadow` / `enforce`) with 409 guard
- [x] `POST /patches/{id}/rollback` — Rollback patch to previous version
- [x] `GET /patches/{id}/export` — Export patch rule (`modsecurity` SecLang or `json`)
- [x] `GET /patches/{id}/promotion` — Shadow to enforce promotion checklist (§B·5)
- [x] `GET /verifications/{id}` — Fetch verification run summary
- [x] `GET /verifications/{id}/cases` — List individual verification test cases
- [x] `GET /events` — Fetch live proxy decision logs (supports `anomaly=1`)
- [x] `GET /events/stats` — Latency percentiles (p50/p95) and decision counts
- [x] `GET /corpus/stats` — Benign and attack traffic corpus statistics
- [x] `GET /benchmarks` — List stored benchmark runs
- [x] `POST /benchmarks/run` — Launch benchmark execution
- [x] `GET /benchmarks/{id}` — Fetch benchmark results
- [x] `GET /stream` — Server-Sent Events stream (§6.4)
- [x] `POST /profiles/rebuild` — Rebuild adaptive route profiles (§B·2)
- [x] `GET /profiles` — List learned route profiles (§B·2)
- [x] `GET /profiles/{id}` — Get single route profile details (§B·2)
- [x] `POST /profiles/{id}/lock` — Generate positive baseline patch for parameter (§B·2)

### Internal Routes (§6.3 & §B·2)
- [x] `GET /internal/v1/rules/active` — Proxy active deployed rules poll (ETag/304)
- [x] `GET /internal/v1/rules/candidate/{patch_id}` — Candidate rule fetch for verification
- [x] `POST /internal/v1/events` — Batch ingest proxy decision logs
- [x] `POST /internal/v1/corpus` — Batch ingest labeled traffic captures
- [x] `GET /internal/v1/profiles/active` — Proxy active profiles poll (ETag/304)

---

## 6. Required Schema Inventory (`packages/contracts/schemas/`)

| Schema File | Section | Root `$id` | Key Properties Validated |
| :--- | :--- | :--- | :--- |
| `rule.schema.json` | §7 | `rule.schema.json` | `schema_version: "1.0"`, `scope`, `inspect`, `normalize`, `condition`, `action: "block"`, `mode` |
| `finding.schema.json` | §5.1, §8.2 | `finding.schema.json` | `category`, `scanner_risk`, `exploit_request`, `exploit_oracle`, `status`, `dedupe_key` |
| `patch.schema.json` | §5.1, §8.4 | `patch.schema.json` | `version`, `source`, `rule` (Rule DSL), `mode`, `status`, `rationale`, `meta` |
| `verification_summary.schema.json` | §5.2 | `verification_summary.schema.json` | `suites`, `gate`, `engine_latency_ms` (p50/p95), `notes` |
| `signal.schema.json` | §5.2, §B·3 | `signal.schema.json` | `id`, `label`, `raw`, `normalized` (0..1), `weight`, `contribution`, `applicable`, `evidence` |
| `sse_events.schema.json` | §6.4, §B·2 | `sse_events.schema.json` | `type` (10 event enums), `ts` (ISO UTC), `data` |
| `explain_output.schema.json` | §9.2 | `explain_output.schema.json` | `summary` (≤280), `why_it_matters` (≤280), `attacker_path` (≤280), `recommended_action` (≤280), `confidence` |
| `rule_draft_output.schema.json` | §9.3 | `rule_draft_output.schema.json` | `candidates` (max 3 Rule DSL items) |
| `route_profile.schema.json` | §B·4 | `route_profile.schema.json` | `location`, `type_distribution`, `dominant_type`, `length`, `charset`, `entropy`, `discriminative` |

---

## 7. Database DDL Inventory (`packages/contracts/ddl/`)

### A. Core DDL (`001_core.sql`)
- Extension: `pgcrypto`
- Core Tables:
  1. `targets` (UUID, `mode in ('learn','protect')`, `internet_facing`)
  2. `scans` (UUID, `scanner in ('zap','recipe','import')`, `status`)
  3. `findings` (UUID, `category`, `scanner_risk`, `dedupe_key unique`, `exploit_confirmed`)
  4. `triage_results` (UUID, `priority_score`, `priority_band in ('P0','P1','P2','P3')`, `signals jsonb`, `llm_explanation jsonb`)
  5. `patches` (UUID, `version`, `source in ('deterministic','llm','hybrid','baseline','hardened')`, `rule jsonb`, `mode in ('shadow','enforce')`)
  6. `verifications` (UUID, `status in ('running','passed','failed','error')`, `summary jsonb`)
  7. `verification_cases` (UUID, `suite in ('exploit_replay','benign_replay','mutation','baseline_conformance')`, `expected`, `outcome`)
  8. `traffic_corpus` (UUID, `label in ('benign','attack')`, `provenance in ('real_capture','public_feed','real_scan')`)
  9. `proxy_events` (Bigserial, `decision in ('allow','block','log_only','error')`, `meta jsonb`)
  10. `intel_kev` (CVE primary key, vendor, product, ransomware_use)
  11. `intel_epss` (CVE primary key, epss numeric, percentile numeric)
  12. `benchmark_runs` (UUID, config jsonb, results jsonb, status)
- Indexes: `findings(target_id, status)`, `proxy_events(target_id, ts desc)`, `traffic_corpus(target_id, label)`, `verification_cases(verification_id, suite)`.

### B. Feature B DDL (`002_feature_b.sql`)
- Table: `route_profiles` (UUID, `target_id`, `method`, `route_template`, `location`, `name`, `profile jsonb`, `sample_count`, `train_count`, `holdout_count`, `discriminative`, `unique (target_id, method, route_template, location, name)`).
- Index: `route_profiles(target_id, route_template)`.

---

## 8. API Route-Stub Inventory (`apps/api/src/routes/`)

Every route handler returns HTTP `501 NOT_IMPLEMENTED` with `{ error: { code: "NOT_IMPLEMENTED", message, details } }`:

- `stubHelper.js` — Shared 501 envelope generator
- `health.js` — Handles `GET /health`
- `llm.js` — Handles `GET /llm/health`, `POST /llm/selftest`
- `targets.js` — Handles `POST /targets`, `GET /targets`, `GET /targets/:id`, `PATCH /targets/:id`
- `scans.js` — Handles `POST /scans`, `POST /scans/import`, `GET /scans`, `GET /scans/:id`
- `findings.js` — Handles `GET /findings`, `GET /findings/:id`, `PATCH /findings/:id`, `POST /findings/:id/confirm`, `GET /findings/:id/triage`, `POST /findings/:id/triage/explain`, `GET /findings/:id/exposure`, `POST /findings/:id/patches`
- `triage.js` — Handles `POST /triage/run`, `GET /triage/compare`
- `intel.js` — Handles `GET /intel/status`, `GET /intel/cve/:cve`
- `patches.js` — Handles `GET /patches`, `GET /patches/:id`, `POST /patches/:id/verify`, `POST /patches/:id/deploy`, `POST /patches/:id/rollback`, `GET /patches/:id/export`, `GET /patches/:id/promotion`
- `verifications.js` — Handles `GET /verifications/:id`, `GET /verifications/:id/cases`
- `events.js` — Handles `GET /events`, `GET /events/stats`
- `corpus.js` — Handles `GET /corpus/stats`
- `benchmarks.js` — Handles `POST /benchmarks/run`, `GET /benchmarks`, `GET /benchmarks/:id`
- `stream.js` — Handles `GET /stream`
- `profiles.js` — Handles `POST /profiles/rebuild`, `GET /profiles`, `GET /profiles/:id`, `POST /profiles/:id/lock`
- `internal.js` — Handles `GET /internal/v1/rules/active`, `GET /internal/v1/rules/candidate/:patch_id`, `POST /internal/v1/events`, `POST /internal/v1/corpus`, `GET /internal/v1/profiles/active`
- `index.js` — **Frozen route registry** wiring all above routers into Express app.

---

## 9. Contract Test Output (`npm run contracts:test`)

```text
> shieldlens@1.0.0 contracts:test
> node scripts/test-contracts.js


=== SHIELDLENS GATE G0 CONTRACT TEST SUITE ===

[1/5] Validating Contract Version Consistency...
  ✔ CONTRACTS_VERSION file exists and contains "1.0"
  ✔ @shieldlens/contracts package.json version is 1.0.0

[2/5] Validating Core Database DDL (§5.1 & §B·1)...
  ✔ 001_core.sql exists and contains all §5.1 tables and pgcrypto
  ✔ 002_feature_b.sql exists and defines route_profiles (§B·1)

[3/5] Validating JSON Schemas with Ajv (§5.2, §7, §9, §B·4)...
  ✔ Schema rule.schema.json exists and parses as valid JSON
  ✔ Schema finding.schema.json exists and parses as valid JSON
  ✔ Schema patch.schema.json exists and parses as valid JSON
  ✔ Schema verification_summary.schema.json exists and parses as valid JSON
  ✔ Schema signal.schema.json exists and parses as valid JSON
  ✔ Schema sse_events.schema.json exists and parses as valid JSON
  ✔ Schema explain_output.schema.json exists and parses as valid JSON
  ✔ Schema rule_draft_output.schema.json exists and parses as valid JSON
  ✔ Schema route_profile.schema.json exists and parses as valid JSON
  ✔ Compile all schemas into Ajv without error
  ✔ Validate sample Rule object against rule.schema.json (§7)
  ✔ Validate sample ExplainOutput object against explain_output.schema.json (§9.2)

[4/5] Validating OpenAPI Specification Coverage (§6 & §B·2)...
  ✔ openapi.yaml exists and parses as valid YAML
  ✔ OpenAPI specifies all 48 frozen routes with 501 stubs

[5/5] Testing Express API Route Stubs (501 NOT_IMPLEMENTED)...
  ✔ All 48 API route stubs return HTTP 501 and NOT_IMPLEMENTED envelope

====================================================
✔ ALL 19 OF 19 CONTRACT CHECKS PASSED SUCCESSFULLY!
====================================================
```

---

## 10. Team Review Status (§5–§9)

- **Person 2 (P2: R2 Control Plane + R4 Frontend):** Complete. Reviewed §3 (Staffing), §4 (Stack), §5 (Data contracts), §6 (API), §7 (Rule DSL), §8 (Pipeline & Verification), §9 (LLM client & safety), §11 (Gates), and Part 2B (Adaptive Baseline & Exposure Triage).
- **Person 1 (P1: R1 Data Plane + R3 AI + R5 Feature/QA):** Pending Owner / P1 confirmation at kickoff.

---

## 11. Outstanding Issues
- **None.** All criteria for Gate G0 Contract Freeze (§11) are satisfied.
- `apps/api/src/routes/index.js` is now frozen and will not be edited during subsequent phases.
- Zero code in `apps/web` has been authored. Frontend implementation remains on hold awaiting Owner G0 clearance.

---

## 12. Owner Verification Commands

The Project Owner can verify this delivery directly with:

```bash
# 1. Verify working branch and tag
git checkout Person2/g0-contracts
git describe --tags --exact-match

# 2. Verify clean working tree
git status

# 3. Execute the contract verification suite
npm run contracts:test
```
