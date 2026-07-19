alter table public.profiles
  add column default_adults smallint not null default 1,
  add column default_children smallint not null default 0,
  add constraint profiles_household_size check (
    default_adults between 1 and 12
    and default_children between 0 and 12
    and default_adults + default_children <= 12
  );

alter table public.trips drop constraint trips_source;
alter table public.trips add constraint trips_source
  check (source in ('MANUAL', 'GOOGLE_CALENDAR', 'ITINERARY_IMPORT', 'TRAVEL_PROVIDER'));

grant update (default_adults, default_children) on public.profiles to authenticated;
