-- AlterTable: password_hash nullable, add OAuth fields
ALTER TABLE "users" ALTER COLUMN "password_hash" DROP NOT NULL;

ALTER TABLE "users" ADD COLUMN "avatar_url" TEXT;
ALTER TABLE "users" ADD COLUMN "auth_provider" TEXT;
ALTER TABLE "users" ADD COLUMN "auth_provider_id" TEXT;

-- CreateIndex: OAuth provider lookup
CREATE INDEX "users_auth_provider_auth_provider_id_idx" ON "users"("auth_provider", "auth_provider_id");

-- Data migration: 기존 이메일 가입 사용자에 auth_provider 설정
UPDATE "users" SET "auth_provider" = 'email' WHERE "password_hash" IS NOT NULL AND "auth_provider" IS NULL;
