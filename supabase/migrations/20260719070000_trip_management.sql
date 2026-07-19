create or replace function public.update_trip_itinerary(
  p_trip_id uuid,
  p_title text,
  p_origin text,
  p_destination text,
  p_starts_at timestamptz,
  p_ends_at timestamptz,
  p_segments jsonb
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  owner_id uuid;
begin
  if jsonb_typeof(p_segments) <> 'array' or jsonb_array_length(p_segments) not between 1 and 8 then
    raise exception 'Trip must contain between one and eight flights.';
  end if;

  select user_id into owner_id
  from public.trips
  where id = p_trip_id and user_id = (select auth.uid())
  for update;

  if owner_id is null then
    raise exception 'Trip not found.' using errcode = '42501';
  end if;

  update public.trips
  set title = p_title,
      origin = p_origin,
      destination = p_destination,
      starts_at = p_starts_at,
      ends_at = p_ends_at
  where id = p_trip_id and user_id = owner_id;

  delete from public.trip_segments where trip_id = p_trip_id and user_id = owner_id;

  insert into public.trip_segments (
    trip_id, user_id, position, flight_number, departure_airport,
    arrival_airport, scheduled_departure, scheduled_arrival, cabin
  )
  select
    p_trip_id,
    owner_id,
    (item.ordinality - 1)::smallint,
    upper(item.value ->> 'flight_number'),
    upper(item.value ->> 'departure_airport'),
    upper(item.value ->> 'arrival_airport'),
    (item.value ->> 'scheduled_departure')::timestamptz,
    (item.value ->> 'scheduled_arrival')::timestamptz,
    upper(item.value ->> 'cabin')
  from jsonb_array_elements(p_segments) with ordinality as item(value, ordinality);

  insert into public.audit_events (user_id, trip_id, event_type, summary, details)
  values (owner_id, p_trip_id, 'TRIP_UPDATED', 'Trip itinerary updated by customer.', jsonb_build_object('flightCount', jsonb_array_length(p_segments)));
end;
$$;

revoke all on function public.update_trip_itinerary(uuid, text, text, text, timestamptz, timestamptz, jsonb) from public, anon;
grant execute on function public.update_trip_itinerary(uuid, text, text, text, timestamptz, timestamptz, jsonb) to authenticated;
