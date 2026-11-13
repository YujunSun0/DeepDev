-- Lemon Squeezy → Paddle 전환
-- LS 스토어는 승인되지 않아 실결제 데이터가 없으므로 LS 컬럼은 삭제한다.

-- LS 테스트 결제로 PRO가 된 사용자는 Paddle 구독이 없으므로 FREE로 되돌린다.
-- (LS 기록이 없는 수동 PRO/MASTER 계정은 건드리지 않음)
UPDATE "users" SET "plan_type" = 'FREE', "subscription_status" = NULL
WHERE "ls_customer_id" IS NOT NULL OR "ls_subscription_id" IS NOT NULL;

ALTER TABLE "users" DROP COLUMN "ls_customer_id",
DROP COLUMN "ls_subscription_id",
ADD COLUMN "paddle_customer_id" TEXT,
ADD COLUMN "paddle_subscription_id" TEXT,
ADD COLUMN "paddle_event_at" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "users_paddle_customer_id_idx" ON "users"("paddle_customer_id");
CREATE INDEX "users_paddle_subscription_id_idx" ON "users"("paddle_subscription_id");

-- CreateTable
CREATE TABLE "webhook_events" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "webhook_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "webhook_events_event_id_key" ON "webhook_events"("event_id");
