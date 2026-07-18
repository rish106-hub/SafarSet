create table public.policies (
  id text primary key,
  family_id text not null,
  payload jsonb not null,
  updated_at timestamptz not null default now(),
  constraint policies_id_length check (char_length(id) between 1 and 100),
  constraint policies_family_id_length check (char_length(family_id) between 1 and 100)
);

create table public.trips (
  id text primary key,
  family_id text not null,
  policy_id text not null references public.policies(id) on delete restrict,
  payload jsonb not null,
  updated_at timestamptz not null default now(),
  constraint trips_id_length check (char_length(id) between 1 and 100),
  constraint trips_family_id_length check (char_length(family_id) between 1 and 100)
);

create table public.recovery_runs (
  id text primary key,
  trip_id text not null references public.trips(id) on delete cascade,
  policy_id text not null references public.policies(id) on delete restrict,
  decision_outcome text not null,
  selected_candidate_id text,
  started_at timestamptz not null,
  completed_at timestamptz not null,
  payload jsonb not null,
  updated_at timestamptz not null default now(),
  constraint recovery_runs_id_length check (char_length(id) between 1 and 160),
  constraint recovery_runs_outcome check (
    decision_outcome in ('AUTO_BOOK', 'REQUEST_APPROVAL', 'ESCALATE')
  ),
  constraint recovery_runs_time_order check (completed_at >= started_at)
);

create table public.audit_events (
  id text primary key,
  recovery_run_id text not null references public.recovery_runs(id) on delete cascade,
  trip_id text not null references public.trips(id) on delete cascade,
  event_at timestamptz not null,
  label text not null,
  payload jsonb not null,
  updated_at timestamptz not null default now(),
  constraint audit_events_id_length check (char_length(id) between 1 and 180),
  constraint audit_events_label_length check (char_length(label) between 1 and 160)
);

create index trips_policy_id_idx on public.trips (policy_id);
create index recovery_runs_trip_id_completed_at_idx
  on public.recovery_runs (trip_id, completed_at desc);
create index recovery_runs_policy_id_idx on public.recovery_runs (policy_id);
create index audit_events_recovery_run_id_event_at_idx
  on public.audit_events (recovery_run_id, event_at asc);
create index audit_events_trip_id_idx on public.audit_events (trip_id);

alter table public.policies enable row level security;
alter table public.trips enable row level security;
alter table public.recovery_runs enable row level security;
alter table public.audit_events enable row level security;

alter table public.policies force row level security;
alter table public.trips force row level security;
alter table public.recovery_runs force row level security;
alter table public.audit_events force row level security;

revoke all on public.policies from public, anon, authenticated;
revoke all on public.trips from public, anon, authenticated;
revoke all on public.recovery_runs from public, anon, authenticated;
revoke all on public.audit_events from public, anon, authenticated;

grant select, insert, update on public.policies to service_role;
grant select, insert, update on public.trips to service_role;
grant select, insert, update on public.recovery_runs to service_role;
grant select, insert, update on public.audit_events to service_role;
