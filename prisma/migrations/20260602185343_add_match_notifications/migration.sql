-- CreateTable
CREATE TABLE "match_notifications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "match_id" TEXT NOT NULL,
    "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "match_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "match_notifications_match_id_idx" ON "match_notifications"("match_id");

-- CreateIndex
CREATE INDEX "match_notifications_sent_at_idx" ON "match_notifications"("sent_at");

-- CreateIndex
CREATE UNIQUE INDEX "match_notifications_user_id_match_id_key" ON "match_notifications"("user_id", "match_id");

-- AddForeignKey
ALTER TABLE "match_notifications" ADD CONSTRAINT "match_notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_notifications" ADD CONSTRAINT "match_notifications_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;
