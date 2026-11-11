# No 3 - User & Company

Relasi user & company di Postgres, 2 versi: raw SQL (`sql/`) dan TypeORM (`orm/`). Beda database (`soal3_sql` / `soal3_orm`) jadi bisa dicoba sendiri2.

## Run

```
docker compose up -d
```

Raw SQL, run berurutan (Git Bash: tambahin `MSYS_NO_PATHCONV=1` di depan):

```
docker exec soal3-postgres psql -U postgres -d soal3_sql -v ON_ERROR_STOP=1 -f /sql/01_schema.sql
docker exec soal3-postgres psql -U postgres -d soal3_sql -v ON_ERROR_STOP=1 -f /sql/02_staging.sql
docker exec soal3-postgres psql -U postgres -d soal3_sql -v ON_ERROR_STOP=1 -f /sql/03_migrate.sql
docker exec soal3-postgres psql -U postgres -d soal3_sql -v ON_ERROR_STOP=1 -f /sql/04_result.sql
```

01 create table, 02 load raw data ke staging, 03 migrate ke table asli, 04 view + query result nya.

ORM:

```
cd orm
cp .env.example .env   # optional, default nya udah sama
npm install
npm run migration:run
npm run seed
npm run result
```

Revert: `npm run migration:revert`. Udahan: `docker compose down -v`.

## Assumptions

- `Uuidv4(12qwer)` = uuid v4 dengan nickname `12qwer`, jadi pake real uuid yg fixed (mapping di `sql/02_staging.sql`). Output nya uuid, bukan nickname.
- Row "Gajah Mada" (user tanpa id) dan "Samudera" (company tanpa id & user_id, alias company yatim) = dirty data, kayak cell excel yg ke-wrap. Ga di-migrate, di-list sebagai skipped di output 03.
- "Samudera" bukan company_name nya SPI, karena di expected result company_name SPI = null.
- Cell kosong -> NULL (email Imron, company_name SPI). Email disimpen apa adanya (`Sammy@mail.com`).

## Design decisions

- INNER JOIN, bukan LEFT: expected result cuma pasangan user + company yg lengkap. LEFT JOIN bakal munculin user tanpa company, RIGHT / FULL munculin company yatim. Null di company_name SPI asalnya dari data, bukan dari outer join.
- Dirty data di-handle 2 lapis: di-filter pas migrate, plus constraint di table (PK, FK `not null`) jadi row yatim emang ga bisa masuk.
- Staging dulu baru migrate, 1 transaction, idempotent (`on conflict (id) do nothing`), re-run aman.
- 1 user : N company, `company_code` unique per user. FK `on delete cascade` karena company ga ada artinya tanpa user nya.
- Email unique case-insensitive (`lower(email)`), telp varchar + check digit biar leading 0 aman.
- `users` / `companies` karena `user` reserved word di postgres.
- Schema SQL & ORM identik (constraint name juga), migration ORM hasil generate.
