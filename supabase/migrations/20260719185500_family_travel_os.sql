create table private.beta_invites (
  id uuid primary key default gen_random_uuid(),
  code_hash text not null unique,
  allowed_email text not null,
  expires_at timestamptz not null,
  redeemed_at timestamptz,
  redeemed_by uuid references auth.users(id) on delete set null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint beta_invites_email_normalized check (allowed_email = lower(allowed_email)),
  constraint beta_invites_hash_length check (char_length(code_hash) = 64),
  constraint beta_invites_expiry check (expires_at > created_at)
);

alter table public.profiles
  add column beta_access_granted_at timestamptz,
  add column interest_travel_wallet boolean not null default false,
  add column interest_loyalty_compass boolean not null default false;

-- Preserve access for accounts created before invite gating was introduced.
update public.profiles set beta_access_granted_at = now() where beta_access_granted_at is null;

create table public.agent_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'New travel request',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint agent_conversations_title_length check (char_length(title) between 1 and 120)
);

create table public.agent_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.agent_conversations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null,
  content text not null,
  source text not null default 'TEXT',
  created_at timestamptz not null default now(),
  constraint agent_messages_role check (role in ('USER', 'ASSISTANT')),
  constraint agent_messages_source check (source in ('TEXT', 'VOICE_TRANSCRIPT')),
  constraint agent_messages_content_length check (char_length(content) between 1 and 12000)
);

create index agent_conversations_user_updated_idx on public.agent_conversations (user_id, updated_at desc);
create index agent_messages_conversation_created_idx on public.agent_messages (conversation_id, created_at);

create trigger agent_conversations_set_updated_at before update on public.agent_conversations
for each row execute function private.set_updated_at();

alter table public.agent_conversations enable row level security;
alter table public.agent_messages enable row level security;

create policy agent_conversations_owner_all on public.agent_conversations for all to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy agent_messages_owner_all on public.agent_messages for all to authenticated
using (
  (select auth.uid()) = user_id
  and exists (
    select 1 from public.agent_conversations conversation
    where conversation.id = conversation_id and conversation.user_id = (select auth.uid())
  )
)
with check (
  (select auth.uid()) = user_id
  and exists (
    select 1 from public.agent_conversations conversation
    where conversation.id = conversation_id and conversation.user_id = (select auth.uid())
  )
);

revoke all on private.beta_invites from public, anon, authenticated;
grant select, insert, update, delete on private.beta_invites to service_role;

revoke all on public.agent_conversations, public.agent_messages from public, anon, authenticated;
grant select, insert, update, delete on public.agent_conversations, public.agent_messages to authenticated;
grant select, insert, update, delete on public.agent_conversations, public.agent_messages to service_role;
grant update (interest_travel_wallet, interest_loyalty_compass) on public.profiles to authenticated;
