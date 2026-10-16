-- Tender v1 / Supabase database setup. Run ONCE in the Supabase SQL Editor.
-- Uses RLS and SECURITY DEFINER helper functions for access verification.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  handle text not null unique check (handle ~ '^[a-z0-9_]{3,20}$'),
  display_name text not null check (char_length(display_name) between 1 and 40),
  bio text not null default '' check (char_length(bio) <= 220),
  game_status text not null default '' check (char_length(game_status) <= 90),
  avatar_url text,
  created_at timestamptz not null default now()
);
create or replace function public.on_tender_signup() returns trigger language plpgsql security definer set search_path = '' as $$
declare h text;
begin
  h := lower(trim(coalesce(new.raw_user_meta_data->>'handle','')));
  if h !~ '^[a-z0-9_]{3,20}$' then raise exception 'Invalid username'; end if;
  insert into public.profiles(id,handle,display_name)
  values (new.id,h,left(coalesce(nullif(trim(new.raw_user_meta_data->>'display_name'),''), h),40));
  return new;
end; $$;
drop trigger if exists on_tender_signup on auth.users;
create trigger on_tender_signup after insert on auth.users for each row execute function public.on_tender_signup();

create table if not exists public.friendships (
 id uuid primary key default gen_random_uuid(),
 requester uuid not null references public.profiles(id) on delete cascade,
 recipient uuid not null references public.profiles(id) on delete cascade,
 status text not null default 'pending' check (status in ('pending','accepted')),
 created_at timestamptz not null default now(),
 check (requester <> recipient),
 unique(requester,recipient)
);
create unique index if not exists friendships_unique_pair on public.friendships(least(requester, recipient), greatest(requester,recipient));

create table if not exists public.conversations (
 id uuid primary key default gen_random_uuid(),
 kind text not null check (kind in ('dm','group')),
 title text not null default '',
 created_by uuid not null references public.profiles(id),
 created_at timestamptz not null default now()
);
create table if not exists public.conversation_members (
 conversation_id uuid not null references public.conversations(id) on delete cascade,
 user_id uuid not null references public.profiles(id) on delete cascade,
 joined_at timestamptz not null default now(),
 primary key(conversation_id,user_id)
);
create table if not exists public.messages (
 id uuid primary key default gen_random_uuid(),
 conversation_id uuid not null references public.conversations(id) on delete cascade,
 author_id uuid not null references public.profiles(id),
 body text not null default '' check (char_length(body) <= 4000),
 attachment_path text,
 created_at timestamptz not null default now(),
 check (char_length(trim(body))>0 or attachment_path is not null)
);
create index if not exists messages_by_conversation on public.messages(conversation_id,created_at);

create table if not exists public.pieces (
 id uuid primary key default gen_random_uuid(),
 name text not null check (char_length(name) between 2 and 70),
 description text not null default '' check (char_length(description)<=500),
 owner_id uuid not null references public.profiles(id),
 color text not null default '#f47735' check (color ~ '^#[0-9a-fA-F]{6}$'),
 icon text not null default '🍗',
 is_public boolean not null default true,
 created_at timestamptz not null default now()
);
create table if not exists public.piece_members (
 piece_id uuid not null references public.pieces(id) on delete cascade,
 user_id uuid not null references public.profiles(id) on delete cascade,
 role text not null default 'member' check (role in ('owner','moderator','member')),
 joined_at timestamptz not null default now(),
 primary key(piece_id,user_id)
);
create table if not exists public.piece_messages (
 id uuid primary key default gen_random_uuid(),
 piece_id uuid not null references public.pieces(id) on delete cascade,
 author_id uuid not null references public.profiles(id),
 body text not null check (char_length(trim(body)) between 1 and 4000),
 created_at timestamptz not null default now()
);
create index if not exists piece_messages_idx on public.piece_messages(piece_id,created_at);
create table if not exists public.piece_posts (
 id uuid primary key default gen_random_uuid(),
 piece_id uuid not null references public.pieces(id) on delete cascade,
 author_id uuid not null references public.profiles(id),
 title text not null check(char_length(trim(title)) between 3 and 130),
 body text not null check(char_length(trim(body)) between 1 and 8000),
 created_at timestamptz not null default now()
);
create table if not exists public.piece_comments (
 id uuid primary key default gen_random_uuid(),
 post_id uuid not null references public.piece_posts(id) on delete cascade,
 author_id uuid not null references public.profiles(id),
 body text not null check(char_length(trim(body)) between 1 and 3000),
 created_at timestamptz not null default now()
);
create table if not exists public.piece_gallery (
 id uuid primary key default gen_random_uuid(),
 piece_id uuid not null references public.pieces(id) on delete cascade,
 author_id uuid not null references public.profiles(id),
 image_path text not null,
 caption text not null default '' check(char_length(caption)<=500),
 created_at timestamptz not null default now()
);
create table if not exists public.reactions (
 id uuid primary key default gen_random_uuid(),
 author_id uuid not null references public.profiles(id) on delete cascade,
 target_type text not null check (target_type in ('message','piece_message','post','gallery')),
 target_id uuid not null,
 emoji text not null check(char_length(emoji) between 1 and 12),
 created_at timestamptz not null default now(),
 unique(author_id,target_type,target_id,emoji)
);

-- Security helper functions: owner of function should be postgres (created in SQL editor).
create or replace function public.is_chat_member(cid uuid, uid uuid default auth.uid())
returns boolean language sql stable security definer set search_path = '' as $$
 select exists(select 1 from public.conversation_members where conversation_id=cid and user_id=uid);
$$;
create or replace function public.is_piece_member(pid uuid, uid uuid default auth.uid())
returns boolean language sql stable security definer set search_path = '' as $$
 select exists(select 1 from public.piece_members where piece_id=pid and user_id=uid);
$$;
create or replace function public.can_view_piece(pid uuid)
returns boolean language sql stable security definer set search_path = '' as $$
 select exists(select 1 from public.pieces where id=pid and (is_public or owner_id=auth.uid()))
    or public.is_piece_member(pid);
$$;
create or replace function public.is_piece_mod(pid uuid)
returns boolean language sql stable security definer set search_path = '' as $$
 select exists(select 1 from public.piece_members where piece_id=pid and user_id=auth.uid() and role in ('owner','moderator'));
$$;
create or replace function public.can_see_target(t text, tid uuid)
returns boolean language plpgsql stable security definer set search_path = '' as $$
begin
 case t
 when 'message' then return exists(select 1 from public.messages where id=tid and public.is_chat_member(conversation_id));
 when 'piece_message' then return exists(select 1 from public.piece_messages where id=tid and public.can_view_piece(piece_id));
 when 'post' then return exists(select 1 from public.piece_posts where id=tid and public.can_view_piece(piece_id));
 when 'gallery' then return exists(select 1 from public.piece_gallery where id=tid and public.can_view_piece(piece_id));
 else return false;
 end case;
end; $$;
create or replace function public.can_react_target(t text, tid uuid)
returns boolean language plpgsql stable security definer set search_path = '' as $$
begin
 case t
 when 'message' then return exists(select 1 from public.messages where id=tid and public.is_chat_member(conversation_id));
 when 'piece_message' then return exists(select 1 from public.piece_messages where id=tid and public.is_piece_member(piece_id));
 when 'post' then return exists(select 1 from public.piece_posts where id=tid and public.is_piece_member(piece_id));
 when 'gallery' then return exists(select 1 from public.piece_gallery where id=tid and public.is_piece_member(piece_id));
 else return false;
 end case;
end; $$;

-- Safe RPC for creating DMs only with accepted friends.
create or replace function public.start_dm(other_id uuid)
returns uuid language plpgsql security definer set search_path = '' as $$
declare existing uuid; result_id uuid;
begin
 if auth.uid() is null or other_id=auth.uid() then raise exception 'Invalid recipient'; end if;
 if not exists(select 1 from public.friendships where status='accepted' and ((requester=auth.uid() and recipient=other_id) or (recipient=auth.uid() and requester=other_id))) then raise exception 'You must be friends first'; end if;
 -- Reduce duplicate DMs from simultaneous requests by advisory transaction lock on ordered UUID pair.
 perform pg_advisory_xact_lock(hashtext(least(auth.uid()::text,other_id::text)||':'||greatest(auth.uid()::text,other_id::text)));
 select c.id into existing from public.conversations c where c.kind='dm'
   and exists(select 1 from public.conversation_members m where m.conversation_id=c.id and m.user_id=auth.uid())
   and exists(select 1 from public.conversation_members m where m.conversation_id=c.id and m.user_id=other_id)
 limit 1;
 if existing is not null then return existing; end if;
 insert into public.conversations(kind,created_by) values('dm',auth.uid()) returning id into result_id;
 insert into public.conversation_members(conversation_id,user_id) values (result_id,auth.uid()),(result_id,other_id);
 return result_id;
end; $$;
create or replace function public.start_group(group_name text, member_ids uuid[])
returns uuid language plpgsql security definer set search_path = '' as $$
declare result_id uuid; member_id uuid;
begin
 if auth.uid() is null or char_length(trim(group_name)) not between 2 and 50 then raise exception 'Invalid group name'; end if;
 if coalesce(array_length(member_ids,1),0)>20 then raise exception 'Maximum 20 invited friends'; end if;
 insert into public.conversations(kind,title,created_by) values('group',trim(group_name),auth.uid()) returning id into result_id;
 insert into public.conversation_members(conversation_id,user_id) values(result_id,auth.uid());
 for member_id in select distinct unnest(member_ids) loop
   if member_id<>auth.uid() and exists(select 1 from public.friendships where status='accepted' and ((requester=auth.uid() and recipient=member_id) or (recipient=auth.uid() and requester=member_id))) then
     insert into public.conversation_members(conversation_id,user_id) values(result_id,member_id) on conflict do nothing;
   end if;
 end loop;
 return result_id;
end; $$;
create or replace function public.create_piece(piece_name text, piece_description text, piece_color text, piece_public boolean)
returns uuid language plpgsql security definer set search_path = '' as $$
declare result_id uuid;
begin
 if auth.uid() is null then raise exception 'Sign in first'; end if;
 if char_length(trim(piece_name)) not between 2 and 70 or char_length(coalesce(piece_description,''))>500 or piece_color !~ '^#[0-9a-fA-F]{6}$' then raise exception 'Invalid Piece'; end if;
 if (select count(*) from public.pieces where owner_id=auth.uid()) >= 8 then raise exception 'Piece limit reached'; end if;
 insert into public.pieces(name,description,color,is_public,owner_id) values(trim(piece_name),coalesce(piece_description,''),piece_color,coalesce(piece_public,true),auth.uid()) returning id into result_id;
 insert into public.piece_members(piece_id,user_id,role) values(result_id,auth.uid(),'owner');
 return result_id;
end; $$;
create or replace function public.join_piece(pid uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
 if auth.uid() is null then raise exception 'Sign in first'; end if;
 if not exists(select 1 from public.pieces where id=pid and is_public) then raise exception 'Not a public Piece'; end if;
 insert into public.piece_members(piece_id,user_id) values(pid,auth.uid()) on conflict do nothing;
end; $$;
create or replace function public.leave_piece(pid uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
 if auth.uid() is null then raise exception 'Sign in first'; end if;
 if exists(select 1 from public.pieces where id=pid and owner_id=auth.uid()) then raise exception 'Owners cannot leave their Piece'; end if;
 delete from public.piece_members where piece_id=pid and user_id=auth.uid();
end; $$;

alter table public.profiles enable row level security;
alter table public.friendships enable row level security;
alter table public.conversations enable row level security;
alter table public.conversation_members enable row level security;
alter table public.messages enable row level security;
alter table public.pieces enable row level security;
alter table public.piece_members enable row level security;
alter table public.piece_messages enable row level security;
alter table public.piece_posts enable row level security;
alter table public.piece_comments enable row level security;
alter table public.piece_gallery enable row level security;
alter table public.reactions enable row level security;

create policy "profiles view" on public.profiles for select to authenticated using(true);
create policy "profiles edit self" on public.profiles for update to authenticated using(id=auth.uid()) with check(id=auth.uid());
create policy "friendships view own" on public.friendships for select to authenticated using(auth.uid() in (requester,recipient));
create policy "friendships request" on public.friendships for insert to authenticated with check(requester=auth.uid() and status='pending');
create policy "friendships accept" on public.friendships for update to authenticated using(recipient=auth.uid() and status='pending') with check(recipient=auth.uid() and status='accepted');
create policy "friendships remove" on public.friendships for delete to authenticated using(auth.uid() in (requester,recipient));
create policy "conversation view own" on public.conversations for select to authenticated using(public.is_chat_member(id));
create policy "members view own conversations" on public.conversation_members for select to authenticated using(public.is_chat_member(conversation_id));
create policy "messages read own" on public.messages for select to authenticated using(public.is_chat_member(conversation_id));
create policy "messages send own" on public.messages for insert to authenticated with check(author_id=auth.uid() and public.is_chat_member(conversation_id));
create policy "messages delete own" on public.messages for delete to authenticated using(author_id=auth.uid());
create policy "pieces view" on public.pieces for select to authenticated using(is_public or owner_id=auth.uid() or public.is_piece_member(id));
create policy "pieces owner edit" on public.pieces for update to authenticated using(owner_id=auth.uid()) with check(owner_id=auth.uid());
create policy "pieces owner delete" on public.pieces for delete to authenticated using(owner_id=auth.uid());
create policy "piece members read" on public.piece_members for select to authenticated using(public.can_view_piece(piece_id));
create policy "piece chat view" on public.piece_messages for select to authenticated using(public.can_view_piece(piece_id));
create policy "piece chat write" on public.piece_messages for insert to authenticated with check(author_id=auth.uid() and public.is_piece_member(piece_id));
create policy "piece chat remove" on public.piece_messages for delete to authenticated using(author_id=auth.uid() or public.is_piece_mod(piece_id));
create policy "posts read" on public.piece_posts for select to authenticated using(public.can_view_piece(piece_id));
create policy "posts create" on public.piece_posts for insert to authenticated with check(author_id=auth.uid() and public.is_piece_member(piece_id));
create policy "posts remove" on public.piece_posts for delete to authenticated using(author_id=auth.uid() or public.is_piece_mod(piece_id));
create policy "comments read" on public.piece_comments for select to authenticated using(exists(select 1 from public.piece_posts p where p.id=post_id and public.can_view_piece(p.piece_id)));
create policy "comments create" on public.piece_comments for insert to authenticated with check(author_id=auth.uid() and exists(select 1 from public.piece_posts p where p.id=post_id and public.is_piece_member(p.piece_id)));
create policy "comments remove" on public.piece_comments for delete to authenticated using(author_id=auth.uid() or exists(select 1 from public.piece_posts p where p.id=post_id and public.is_piece_mod(p.piece_id)));
create policy "gallery read" on public.piece_gallery for select to authenticated using(public.can_view_piece(piece_id));
create policy "gallery create" on public.piece_gallery for insert to authenticated with check(author_id=auth.uid() and public.is_piece_member(piece_id));
create policy "gallery remove" on public.piece_gallery for delete to authenticated using(author_id=auth.uid() or public.is_piece_mod(piece_id));
create policy "reactions read" on public.reactions for select to authenticated using(public.can_see_target(target_type,target_id));
create policy "reactions create" on public.reactions for insert to authenticated with check(author_id=auth.uid() and public.can_react_target(target_type,target_id));
create policy "reactions remove" on public.reactions for delete to authenticated using(author_id=auth.uid());

-- Object storage. Chat files are private. Piece gallery files are public (only public Pieces can be uploaded to gallery in v1).
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values
 ('tender-chat','tender-chat',false,5242880,array['image/png','image/jpeg','image/webp','image/gif','application/pdf']),
 ('tender-gallery','tender-gallery',true,5242880,array['image/png','image/jpeg','image/webp','image/gif']),
 ('tender-avatars','tender-avatars',true,2097152,array['image/png','image/jpeg','image/webp'])
on conflict (id) do update set public=excluded.public,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;
create or replace function public.chat_object_access(path text) returns boolean language plpgsql security definer set search_path = '' as $$
declare cid uuid;
begin
 cid := split_part(path,'/',1)::uuid;
 return public.is_chat_member(cid);
exception when others then return false;
end; $$;
create or replace function public.gallery_object_access(path text) returns boolean language plpgsql security definer set search_path = '' as $$
declare pid uuid;
begin pid:=split_part(path,'/',1)::uuid; return public.is_piece_member(pid) and exists(select 1 from public.pieces where id=pid and is_public);
exception when others then return false;
end; $$;
create policy "private chat files read" on storage.objects for select to authenticated using(bucket_id='tender-chat' and public.chat_object_access(name));
create policy "private chat files upload" on storage.objects for insert to authenticated with check(bucket_id='tender-chat' and public.chat_object_access(name) and split_part(name,'/',2)=auth.uid()::text);
create policy "public gallery file upload" on storage.objects for insert to authenticated with check(bucket_id='tender-gallery' and public.gallery_object_access(name) and split_part(name,'/',2)=auth.uid()::text);
create policy "avatar file upload" on storage.objects for insert to authenticated with check(bucket_id='tender-avatars' and split_part(name,'/',1)=auth.uid()::text);
create policy "avatar file update" on storage.objects for update to authenticated using(bucket_id='tender-avatars' and split_part(name,'/',1)=auth.uid()::text) with check(bucket_id='tender-avatars' and split_part(name,'/',1)=auth.uid()::text);

-- Supabase Realtime requires publication inclusion.
do $$ begin
 alter publication supabase_realtime add table public.messages;
exception when duplicate_object then null; end $$;
do $$ begin
 alter publication supabase_realtime add table public.piece_messages;
exception when duplicate_object then null; end $$;
do $$ begin
 alter publication supabase_realtime add table public.piece_posts;
exception when duplicate_object then null; end $$;
do $$ begin
 alter publication supabase_realtime add table public.piece_gallery;
exception when duplicate_object then null; end $$;

-- RPC functions are only callable by signed-in users.
revoke all on function public.start_dm(uuid) from public, anon;
revoke all on function public.start_group(text,uuid[]) from public, anon;
revoke all on function public.create_piece(text,text,text,boolean) from public, anon;
revoke all on function public.join_piece(uuid) from public, anon;
revoke all on function public.leave_piece(uuid) from public, anon;
grant execute on function public.start_dm(uuid), public.start_group(text,uuid[]), public.create_piece(text,text,text,boolean), public.join_piece(uuid), public.leave_piece(uuid) to authenticated;