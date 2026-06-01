/*
  Warnings:

  - You are about to drop the column `round` on the `bracket_predictions` table. All the data in the column will be lost.
  - You are about to drop the column `slot` on the `bracket_predictions` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[user_id,match_id]` on the table `bracket_predictions` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `match_id` to the `bracket_predictions` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "bracket_predictions_user_id_round_slot_key";

-- AlterTable
ALTER TABLE "bracket_predictions" DROP COLUMN "round",
DROP COLUMN "slot",
ADD COLUMN     "match_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "matches" ADD COLUMN     "penalty_winner_id" TEXT;

-- AlterTable
ALTER TABLE "tournament_predictions" ALTER COLUMN "golden_boot_player_id" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "bracket_predictions_match_id_idx" ON "bracket_predictions"("match_id");

-- CreateIndex
CREATE UNIQUE INDEX "bracket_predictions_user_id_match_id_key" ON "bracket_predictions"("user_id", "match_id");

-- AddForeignKey
ALTER TABLE "bracket_predictions" ADD CONSTRAINT "bracket_predictions_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;
