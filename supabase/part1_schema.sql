-- BloodBridge Part 1 schema (Donor & Attender). Merge with Part 3's master schema.
create extension if not exists pgcrypto;

create table profiles (
  id uuid primary key references auth.users on delete cascade,
  role text not null check (role in ('donor','attender','hospital','admin')),
  full_name text not null,
  phone text,
  created_at timestamptz default now()
);

create table hospitals (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text not null
);

create table donors (
  user_id uuid primary key references profiles(id) on delete cascade,
  full_name text not null,
  blood_group text not null check (blood_group in ('A+','A-','B+','B-','AB+','AB-','O+','O-')),
  city text not null,
  area text,                         -- approximate only, never exact address
  available boolean default true,
  id_verified boolean default false, -- set by Part 4, not by the donor
  last_donated date
);

create table blood_requests (
  id uuid primary key default gen_random_uuid(),
  attender_id uuid not null references profiles(id),
  hospital_id uuid not null references hospitals(id),
  patient_ref text not null,
  blood_group text not null,
  units_required int not null check (units_required between 1 and 20),
  units_fulfilled int not null default 0,
  urgency text not null default 'urgent' check (urgency in ('critical','urgent','planned')),
  notes text,
  status text not null default 'open' check (status in ('open','closed','cancelled')),
  created_at timestamptz default now()
);

create table request_participants (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references blood_requests(id) on delete cascade,
  donor_id uuid references donors(user_id),      -- null until an external donor joins
  invited_name text,
  source text not null check (source in ('platform','external')),
  invite_token text unique default encode(gen_random_bytes(12),'hex'),
  status text not null default 'invited'
    check (status in ('invited','accepted','declined','cancelled','arrived','donated','deferred','no_show')),
  created_at timestamptz default now(),
  unique (request_id, donor_id)
);

-- Auto-create profile on signup from user metadata
create or replace function handle_new_user() returns trigger language plpgsql security definer as $$
begin
  insert into profiles(id, role, full_name, phone)
  values (new.id, coalesce(new.raw_user_meta_data->>'role','attender'),
          coalesce(new.raw_user_meta_data->>'full_name','Unnamed'), new.raw_user_meta_data->>'phone');
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function handle_new_user();

-- Donor responds to an invite. Donors cannot set hospital-owned statuses (Part 2).
create or replace function respond_to_request(p_id uuid, p_response text)
returns void language plpgsql security definer as $$
begin
  if p_response not in ('accepted','declined','cancelled') then raise exception 'invalid response'; end if;
  update request_participants set status = p_response
   where id = p_id and donor_id = auth.uid()
     and status in ('invited','accepted','declined');
  if not found then raise exception 'cannot update this invite'; end if;
end $$;

-- External donor claims an invite link after signing in
create or replace function claim_invite(p_token text)
returns uuid language plpgsql security definer as $$
declare rid uuid;
begin
  update request_participants set donor_id = auth.uid()
   where invite_token = p_token and donor_id is null
     and exists (select 1 from donors where user_id = auth.uid())
  returning request_id into rid;
  if rid is null then raise exception 'Invite invalid, already used, or donor profile missing'; end if;
  return rid;
end $$;

-- Safe preview of an invite so the link page works before login
create or replace function invite_preview(p_token text)
returns table(hospital text, blood_group text, urgency text, invited_name text)
language sql security definer as $$
  select h.name, r.blood_group, r.urgency, p.invited_name
  from request_participants p join blood_requests r on r.id=p.request_id
  join hospitals h on h.id=r.hospital_id
  where p.invite_token = p_token and p.donor_id is null and r.status='open';
$$;
grant execute on function invite_preview(text) to anon, authenticated;

-- RLS
alter table profiles enable row level security;
alter table hospitals enable row level security;
alter table donors enable row level security;
alter table blood_requests enable row level security;
alter table request_participants enable row level security;

create policy "own profile" on profiles for select using (id = auth.uid());
create policy "hospitals readable" on hospitals for select to authenticated using (true);

create policy "donors browse" on donors for select to authenticated using (true);
create policy "donor insert own" on donors for insert with check (user_id = auth.uid() and id_verified = false);
create policy "donor update own" on donors for update using (user_id = auth.uid())
  with check (user_id = auth.uid() and id_verified = (select d.id_verified from donors d where d.user_id = auth.uid()));

create policy "attender manages requests" on blood_requests for all
  using (attender_id = auth.uid()) with check (attender_id = auth.uid());
create policy "donor sees own requests" on blood_requests for select
  using (exists (select 1 from request_participants p where p.request_id = id and p.donor_id = auth.uid()));

create policy "attender sees participants" on request_participants for select
  using (exists (select 1 from blood_requests r where r.id = request_id and r.attender_id = auth.uid()));
create policy "attender adds participants" on request_participants for insert
  with check (status = 'invited' and exists (select 1 from blood_requests r where r.id = request_id and r.attender_id = auth.uid()));
create policy "attender removes invited" on request_participants for delete
  using (status = 'invited' and exists (select 1 from blood_requests r where r.id = request_id and r.attender_id = auth.uid()));
create policy "donor sees own participation" on request_participants for select using (donor_id = auth.uid());

insert into hospitals(name, city) values
 ('Victoria Hospital','Bengaluru'),('St. John''s Medical College Hospital','Bengaluru'),('Manipal Hospital, Old Airport Road','Bengaluru');
