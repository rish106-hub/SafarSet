-- Production beta schema. Existing rows were synthetic demo evidence.
drop table if exists public.audit_events cascade;
drop table if exists public.recovery_runs cascade;
drop table if exists public.trips cascade;
drop table if exists public.policies cascade;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null default '',
  home_airport text,
  timezone text not null default 'Asia/Kolkata',
  onboarding_complete boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_email_length check (char_length(email) between 3 and 320),
  constraint profiles_name_length check (char_length(full_name) <= 120),
  constraint profiles_airport check (home_airport is null or home_airport ~ '^[A-Z]{3}$')
);

insert into public.profiles (user_id, email, full_name)
select id, coalesce(email, ''), coalesce(raw_user_meta_data ->> 'full_name', '')
from auth.users
on conflict (user_id) do nothing;

create table public.policies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null default 'Primary recovery policy',
  require_family_together boolean not null default true,
  forbid_self_transfer boolean not null default true,
  minimum_cabin text not null default 'ECONOMY',
  max_stops smallint not null default 1,
  approved_transit_airports text[] not null default '{}',
  minimum_connection_minutes smallint not null default 90,
  maximum_arrival_delay_minutes integer not null default 720,
  auto_spend_limit_minor integer not null default 0,
  approval_above_minor integer not null default 0,
  currency text not null default 'INR',
  avoid_overnight boolean not null default true,
  notify_email boolean not null default true,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint policies_name_length check (char_length(name) between 1 and 100),
  constraint policies_cabin check (minimum_cabin in ('ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST')),
  constraint policies_stops check (max_stops between 0 and 3),
  constraint policies_connection check (minimum_connection_minutes between 30 and 480),
  constraint policies_arrival_delay check (maximum_arrival_delay_minutes between 60 and 4320),
  constraint policies_spend check (auto_spend_limit_minor >= 0 and approval_above_minor >= auto_spend_limit_minor),
  constraint policies_currency check (currency = 'INR'),
  constraint policies_transit_codes check (
    approved_transit_airports <@ array[
      'AUH','BKK','BOM','CDG','DEL','DOH','DXB','FRA','HKG','IST','LHR','SIN','ZRH'
    ]::text[]
  )
);

create unique index policies_one_default_per_user_idx
  on public.policies (user_id) where is_default;

create table public.trips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  policy_id uuid references public.policies(id) on delete set null,
  title text not null,
  origin text not null,
  destination text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  adults smallint not null default 1,
  children smallint not null default 0,
  source text not null default 'MANUAL',
  external_reference text,
  status text not null default 'UPCOMING',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint trips_title_length check (char_length(title) between 1 and 140),
  constraint trips_airports check (origin ~ '^[A-Z]{3}$' and destination ~ '^[A-Z]{3}$' and origin <> destination),
  constraint trips_time_order check (ends_at > starts_at),
  constraint trips_travelers check (adults between 1 and 12 and children between 0 and 12 and adults + children <= 12),
  constraint trips_source check (source in ('MANUAL', 'GOOGLE_CALENDAR', 'TRAVEL_PROVIDER')),
  constraint trips_status check (status in ('UPCOMING', 'MONITORING', 'DISRUPTED', 'COMPLETED', 'CANCELLED'))
);

create table public.trip_segments (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  position smallint not null,
  flight_number text not null,
  departure_airport text not null,
  arrival_airport text not null,
  scheduled_departure timestamptz not null,
  scheduled_arrival timestamptz not null,
  cabin text not null default 'ECONOMY',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint trip_segments_position check (position between 0 and 8),
  constraint trip_segments_flight check (flight_number ~ '^[A-Z0-9]{2}[0-9]{1,4}$'),
  constraint trip_segments_airports check (
    departure_airport ~ '^[A-Z]{3}$' and arrival_airport ~ '^[A-Z]{3}$' and departure_airport <> arrival_airport
  ),
  constraint trip_segments_time_order check (scheduled_arrival > scheduled_departure),
  constraint trip_segments_cabin check (cabin in ('ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST')),
  unique (trip_id, position)
);

create table public.recovery_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  trip_id uuid not null references public.trips(id) on delete cascade,
  policy_id uuid references public.policies(id) on delete set null,
  decision_outcome text not null,
  selected_candidate_id text,
  reason text not null,
  provider_mode text not null,
  payload jsonb not null,
  started_at timestamptz not null,
  completed_at timestamptz not null,
  created_at timestamptz not null default now(),
  constraint recovery_runs_outcome check (decision_outcome in ('AUTO_BOOK', 'REQUEST_APPROVAL', 'ESCALATE')),
  constraint recovery_runs_provider check (provider_mode in ('LIVE', 'UNAVAILABLE')),
  constraint recovery_runs_time_order check (completed_at >= started_at)
);

create table public.audit_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  trip_id uuid references public.trips(id) on delete cascade,
  recovery_run_id uuid references public.recovery_runs(id) on delete cascade,
  event_type text not null,
  summary text not null,
  details jsonb not null default '{}',
  created_at timestamptz not null default now(),
  constraint audit_events_type_length check (char_length(event_type) between 1 and 80),
  constraint audit_events_summary_length check (char_length(summary) between 1 and 240)
);

create table private.provider_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null,
  encrypted_access_token text,
  encrypted_refresh_token text,
  token_expires_at timestamptz,
  status text not null default 'CONNECTED',
  provider_account text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint provider_connections_provider check (provider in ('GOOGLE_CALENDAR')),
  constraint provider_connections_status check (status in ('CONNECTED', 'REAUTH_REQUIRED', 'DISCONNECTED')),
  unique (user_id, provider)
);

create index trips_user_starts_idx on public.trips (user_id, starts_at desc);
create index trip_segments_trip_position_idx on public.trip_segments (trip_id, position);
create index recovery_runs_user_trip_idx on public.recovery_runs (user_id, trip_id, completed_at desc);
create index audit_events_user_created_idx on public.audit_events (user_id, created_at desc);

create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at before update on public.profiles
for each row execute function private.set_updated_at();
create trigger policies_set_updated_at before update on public.policies
for each row execute function private.set_updated_at();
create trigger trips_set_updated_at before update on public.trips
for each row execute function private.set_updated_at();
create trigger trip_segments_set_updated_at before update on public.trip_segments
for each row execute function private.set_updated_at();
create trigger provider_connections_set_updated_at before update on private.provider_connections
for each row execute function private.set_updated_at();

create or replace function private.create_profile_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (user_id, email, full_name)
  values (new.id, coalesce(new.email, ''), coalesce(new.raw_user_meta_data ->> 'full_name', ''));
  return new;
end;
$$;

revoke all on function private.create_profile_for_new_user() from public, anon, authenticated;
create trigger auth_user_created
after insert on auth.users
for each row execute function private.create_profile_for_new_user();

alter table public.profiles enable row level security;
alter table public.policies enable row level security;
alter table public.trips enable row level security;
alter table public.trip_segments enable row level security;
alter table public.recovery_runs enable row level security;
alter table public.audit_events enable row level security;

create policy profiles_select_own on public.profiles for select to authenticated
using ((select auth.uid()) = user_id or (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
create policy profiles_update_own on public.profiles for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy policies_owner_all on public.policies for all to authenticated
using ((select auth.uid()) = user_id or (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((select auth.uid()) = user_id or (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
create policy trips_owner_all on public.trips for all to authenticated
using ((select auth.uid()) = user_id or (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check (
  (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  or (
    (select auth.uid()) = user_id
    and (
      policy_id is null
      or exists (
        select 1 from public.policies owner_policy
        where owner_policy.id = policy_id and owner_policy.user_id = (select auth.uid())
      )
    )
  )
);
create policy trip_segments_owner_all on public.trip_segments for all to authenticated
using (
  (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  or (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.trips owner_trip
      where owner_trip.id = trip_id and owner_trip.user_id = (select auth.uid())
    )
  )
)
with check (
  (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  or (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.trips owner_trip
      where owner_trip.id = trip_id and owner_trip.user_id = (select auth.uid())
    )
  )
);
create policy recovery_runs_owner_select on public.recovery_runs for select to authenticated
using ((select auth.uid()) = user_id or (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
create policy audit_events_owner_select on public.audit_events for select to authenticated
using ((select auth.uid()) = user_id or (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

revoke all on public.profiles, public.policies, public.trips, public.trip_segments, public.recovery_runs, public.audit_events from public, anon, authenticated;
grant select on public.profiles to authenticated;
grant update (full_name, home_airport, timezone, onboarding_complete) on public.profiles to authenticated;
grant select, insert, update, delete on public.policies, public.trips, public.trip_segments to authenticated;
grant select on public.recovery_runs, public.audit_events to authenticated;
grant select, insert, update, delete on all tables in schema public to service_role;
grant usage on schema private to service_role;
grant select, insert, update, delete on private.provider_connections to service_role;
