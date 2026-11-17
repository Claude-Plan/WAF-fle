-- 002_feature_b.sql
-- ShieldLens Prototype B Adaptive Baseline Schema
-- Frozen per §B·1 of Master Build Prompt

create table route_profiles(
  id uuid primary key default gen_random_uuid(),
  target_id uuid not null references targets(id),
  method text not null,
  route_template text not null,
  location text not null check (location in ('query','body_form','body_json','header','cookie','path')),
  name text not null,
  profile jsonb not null, -- RouteProfile §B·4
  sample_count int not null,
  train_count int not null,
  holdout_count int not null,
  discriminative boolean not null default false,
  updated_at timestamptz not null default now(),
  unique (target_id, method, route_template, location, name)
);

create index on route_profiles(target_id, route_template);
