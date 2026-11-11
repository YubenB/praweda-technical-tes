-- raw data exactly like in soal (anggep aja hasil import from excel), all columns text
-- rows "Gajah Mada" & "Samudera" yg ga ada id nya ikut masuk here, nanti di-drop pas migrate

create schema if not exists staging;

create table if not exists staging.users (
  row_no  int primary key,
  id      text,
  nama    text,
  email   text,
  telp    text
);

create table if not exists staging.companies (
  row_no        int primary key,
  id            text,
  user_id       text,
  company_code  text,
  company_name  text
);

-- "Uuidv4(12qwer)" in soal = uuid v4, 12qwer is just the nickname. these are the real uuid
create table if not exists staging.id_map (
  nick  text primary key,
  id    text not null
);

truncate staging.users, staging.companies, staging.id_map;

insert into staging.id_map (nick, id) values
  ('12qwer',     'd12312a0-290a-44fd-bcde-53a4697604b9'),
  ('321rewq',    '31cf38f0-1747-432b-ae7c-3c81597b0073'),
  ('trew098',    '0505e8eb-516a-41be-82a4-b9287e57750f'),
  ('poiuyt1234', '21e131c0-502e-4e46-9323-9511b4ecd197');

insert into staging.users (row_no, id, nama, email, telp) values
  (1, 'Uuidv4(12qwer)',  'Imron',      '',               '081234567890'),
  (2, 'Uuidv4(321rewq)', 'Juli',       'Sammy@mail.com', '0987654321'),
  (3, '',                'Gajah Mada', '',               '');

insert into staging.companies (row_no, id, user_id, company_code, company_name) values
  (1, 'Uuidv4(trew098)',    '12qwer',  'SPI', ''),
  (2, '',                   '',        '',    'Samudera'),
  (3, 'Uuidv4(poiuyt1234)', '321rewq', 'PIC', 'Samudera');

-- "Uuidv4(12qwer)" / "12qwer" / empty -> uuid or null
create or replace function staging.resolve_id(raw text) returns uuid
language sql stable as $$
  select m.id::uuid
  from staging.id_map m
  where m.nick = coalesce(substring(trim(raw) from '^[Uu]uidv4\((.+)\)$'), nullif(trim(raw), ''))
$$;
