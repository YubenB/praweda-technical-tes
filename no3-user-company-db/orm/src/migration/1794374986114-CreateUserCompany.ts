import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUserCompany1794374986114 implements MigrationInterface {
    name = 'CreateUserCompany1794374986114'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "companies" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "user_id" uuid NOT NULL, "company_code" character varying(20) NOT NULL, "company_name" character varying(150), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "companies_user_id_company_code_key" UNIQUE ("user_id", "company_code"), CONSTRAINT "companies_pkey" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "nama" character varying(100) NOT NULL, "email" character varying(150), "telp" character varying(20), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "users_telp_check" CHECK ("telp" ~ '^\\+?[0-9]{8,15}$'), CONSTRAINT "users_pkey" PRIMARY KEY ("id"))`);
        // manual: expression index ga ke-generate (see @Index synchronize false di User)
        await queryRunner.query(`CREATE UNIQUE INDEX "uq_users_email" ON "users" (lower("email"))`);
        await queryRunner.query(`ALTER TABLE "companies" ADD CONSTRAINT "companies_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "companies" DROP CONSTRAINT "companies_user_id_fkey"`);
        await queryRunner.query(`DROP INDEX "public"."uq_users_email"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TABLE "companies"`);
    }

}
