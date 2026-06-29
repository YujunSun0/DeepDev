-- CreateTable
CREATE TABLE "user_daily_attendances" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_daily_attendances_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_daily_attendances_user_id_date_key" ON "user_daily_attendances"("user_id", "date");

-- AddForeignKey
ALTER TABLE "user_daily_attendances" ADD CONSTRAINT "user_daily_attendances_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
