-- "user" is a reserved word in postgres, so pake users / companies biar ga perlu quote2 terus
-- gen_random_uuid() already built-in since pg 13, no need extension
-- nama constraint pake default postgres, entity di orm/ pake nama yg sama jadi schema nya identik
begin;

create table if not exists users (
  id          uuid primary key default gen_random_uuid(),
  nama        varchar(100) not null,
  email       varchar(150),
  telp        varchar(20) check (telp ~ '^\+?[0-9]{8,15}$'), -- varchar so the leading 0 ga ilang
  created_at  timestamptz not null default now()
);

-- email can be null, but kalo ada must be unique (case insensitive)
create unique index if not exists uq_users_email on users (lower(email));

-- 1 user bisa punya banyak company (1:N), tapi company_code ga boleh dobel di user yg sama.
-- index dari unique ini ke-pake juga buat lookup by user_id (leading column), so ga perlu index user_id sendiri
create table if not exists companies (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references users (id) on delete cascade, -- company ga ada artinya tanpa user nya
  company_code  varchar(20) not null,
  company_name  varchar(150),
  created_at    timestamptz not null default now(),
  unique (user_id, company_code)
);

commit;
