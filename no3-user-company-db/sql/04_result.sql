create or replace view v_user_company as
select
  u.id            as user_id,
  c.id            as company_id,
  u.nama,
  u.email,
  u.telp,
  c.company_code,
  c.company_name
from users u
join companies c on c.user_id = u.id;

\pset null null

select * from v_user_company order by nama, company_code;
