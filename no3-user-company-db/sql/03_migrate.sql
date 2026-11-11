-- move data from staging to the real tables. safe to run berkali2, row yg id nya udah ada di-skip.
-- conflict target sengaja id aja: conflict lain (misal email dobel) error & 1 transaction rollback semua
begin;

insert into users (id, nama, email, telp)
select
  staging.resolve_id(s.id),
  trim(s.nama),
  nullif(trim(s.email), ''),
  nullif(trim(s.telp), '')
from staging.users s
where staging.resolve_id(s.id) is not null -- rows without id (Gajah Mada) di-skip
order by s.row_no
on conflict (id) do nothing;

insert into companies (id, user_id, company_code, company_name)
select
  staging.resolve_id(c.id),
  u.id,
  trim(c.company_code),
  nullif(trim(c.company_name), '')
from staging.companies c
join users u on u.id = staging.resolve_id(c.user_id) -- only company yg user nya exists
where staging.resolve_id(c.id) is not null
order by c.row_no
on conflict (id) do nothing;

commit;

-- staging rows yg ga ke-migrate + the reason. staging nya sengaja ga di-drop, buat dicek & re-run
select 'users' as tbl, s.row_no, s.nama as data, 'empty id' as reason
from staging.users s
where staging.resolve_id(s.id) is null
union all
select 'companies', c.row_no, coalesce(nullif(c.company_name, ''), c.company_code),
  case when staging.resolve_id(c.id) is null then 'empty id' else 'user_id not found' end
from staging.companies c
where staging.resolve_id(c.id) is null
   or not exists (select 1 from users u where u.id = staging.resolve_id(c.user_id))
order by tbl desc, row_no;
