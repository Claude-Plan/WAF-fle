-- 001_core.sql
-- ShieldLens Core Database Schema (contracts_version 1.0)
-- Frozen per §5.1 of Master Build Prompt

create extension if not exists pgcrypto;

create table targets(
  id uuid primary key default gen_random_uuid(),
  name text not null,
  base_url text not null,
  proxy_url text not null,
  mode text not null default 'protect' check (mode in ('learn','protect')),
  internet_facing boolean not null default true,
  created_at timestamptz not null default now()
);

create table scans(
  id uuid primary key default gen_random_uuid(),
  target_id uuid not null references targets(id),
  scanner text not null check (scanner in ('zap','recipe','import')),
  status text not null default 'queued' check (status in ('queued','running','completed','failed')),
  started_at timestamptz,
  finished_at timestamptz,
  stats jsonb not null default '{}',
  error text,
  provenance text not null default 'real_scan',
  created_at timestamptz not null default now()
);

create table findings(
  id uuid primary key default gen_random_uuid(),
  scan_id uuid not null references scans(id),
  target_id uuid not null references targets(id),
  title text not null,
  cwe int,
  cve text,
  category text not null check (category in ('sqli','xss','cmdi','path_traversal','ssrf','auth','info_leak','other')),
  scanner_risk text not null check (scanner_risk in ('info','low','medium','high','critical')),
  method text not null,
  url text not null,
  route_template text,
  param text,
  param_location text check (param_location in ('query','body_form','body_json','header','cookie','path')),
  evidence text,
  exploit_request jsonb, -- {method,url,headers,body}
  exploit_oracle jsonb, -- see §8.2
  exploit_confirmed boolean not null default false,
  status text not null default 'open' check (status in ('open','triaged','patched','verified','dismissed')),
  dedupe_key text not null unique,
  provenance text not null check (provenance in ('real_scan','real_capture','public_feed','user_input','generated')),
  created_at timestamptz not null default now()
);

create table triage_results(
  id uuid primary key default gen_random_uuid(),
  finding_id uuid not null unique references findings(id),
  model_version text not null check (model_version in ('base-v1','exposure-v1')),
  priority_score numeric(5,2) not null,
  priority_band text not null check (priority_band in ('P0','P1','P2','P3')),
  signals jsonb not null, -- §5.2 Signal[]
  llm_explanation jsonb, -- §9.2 ExplainOutput
  llm_status text not null default 'skipped' check (llm_status in ('ok','fallback','skipped')),
  llm_model text,
  created_at timestamptz not null default now()
);

create table patches(
  id uuid primary key default gen_random_uuid(),
  finding_id uuid not null references findings(id),
  version int not null default 1,
  parent_patch_id uuid references patches(id),
  source text not null check (source in ('deterministic','llm','hybrid','baseline','hardened')),
  rule jsonb, -- Rule DSL §7 (null while generating)
  mode text not null default 'shadow' check (mode in ('shadow','enforce')),
  status text not null default 'generating' check (status in ('generating','draft','verifying','verified','failed','deployed','rolled_back')),
  rationale text,
  meta jsonb not null default '{}',
  created_at timestamptz not null default now(),
  deployed_at timestamptz
);

create table verifications(
  id uuid primary key default gen_random_uuid(),
  patch_id uuid not null references patches(id),
  status text not null default 'running' check (status in ('running','passed','failed','error')),
  summary jsonb not null default '{}', -- §5.2 VerificationSummary
  started_at timestamptz not null default now(),
  finished_at timestamptz
);

create table verification_cases(
  id uuid primary key default gen_random_uuid(),
  verification_id uuid not null references verifications(id),
  suite text not null check (suite in ('exploit_replay','benign_replay','mutation','baseline_conformance')),
  name text not null,
  request jsonb not null,
  direct_result jsonb,
  proxied_result jsonb,
  expected text not null check (expected in ('block','allow')),
  outcome text not null check (outcome in ('pass','fail','skipped','invalid_mutant')),
  details jsonb not null default '{}'
);

create table traffic_corpus(
  id uuid primary key default gen_random_uuid(),
  target_id uuid not null references targets(id),
  label text not null check (label in ('benign','attack')),
  method text not null,
  url text not null,
  headers jsonb not null default '{}',
  body text,
  provenance text not null check (provenance in ('real_capture','public_feed','real_scan')),
  captured_at timestamptz not null default now()
);

create table proxy_events(
  id bigserial primary key,
  ts timestamptz not null default now(),
  target_id uuid references targets(id),
  method text,
  path text,
  route_template text,
  client_ip text,
  decision text not null check (decision in ('allow','block','log_only','error')),
  rule_id uuid,
  patch_id uuid,
  latency_ms numeric,
  status_code int,
  meta jsonb not null default '{}' -- meta.source in user|scanner|attacker|corpus|verifier ; meta.would_block bool
);

create table intel_kev(
  cve text primary key,
  vendor text,
  product text,
  date_added date,
  due_date date,
  ransomware_use text,
  raw jsonb
);

create table intel_epss(
  cve text primary key,
  epss numeric not null,
  percentile numeric not null,
  score_date date not null
);

create table benchmark_runs(
  id uuid primary key default gen_random_uuid(),
  target_id uuid references targets(id),
  config jsonb not null,
  results jsonb,
  status text not null default 'queued' check (status in ('queued','running','completed','failed')),
  created_at timestamptz not null default now()
);

create index on findings(target_id, status);
create index on proxy_events(target_id, ts desc);
create index on traffic_corpus(target_id, label);
create index on verification_cases(verification_id, suite);
