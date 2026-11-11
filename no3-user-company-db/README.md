# No 3 - User & Company

Postgres via docker:

```
docker compose up -d
```

## SQL

Run file di `sql/` berurutan (01 - 04):

```
docker exec soal3-postgres psql -U postgres -d soal3_sql -v ON_ERROR_STOP=1 -f /sql/01_schema.sql
docker exec soal3-postgres psql -U postgres -d soal3_sql -v ON_ERROR_STOP=1 -f /sql/02_staging.sql
docker exec soal3-postgres psql -U postgres -d soal3_sql -v ON_ERROR_STOP=1 -f /sql/03_migrate.sql
docker exec soal3-postgres psql -U postgres -d soal3_sql -v ON_ERROR_STOP=1 -f /sql/04_result.sql
```

01 create table, 02 insert raw data ke staging, 03 migrate ke table asli, 04 query result nya.

## ORM (TypeORM)

```
cd orm
npm install
npm run migration:run
npm run seed
npm run result
```

Revert: `npm run migration:revert`.

## Notes

- `12qwer` dll di soal aku anggep nickname dari uuid, jadi pake real uuid (mapping nya di `sql/02_staging.sql`).
- Row Gajah Mada & Samudera ga ada id nya jadi di-skip, result nya 2 rows sesuai soal.
- User 1:N company (`company_code` unique per user), email unique case insensitive. Schema SQL & ORM sama persis, constraint nya juga.
