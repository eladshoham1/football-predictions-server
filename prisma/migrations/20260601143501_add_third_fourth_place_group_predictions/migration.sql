-- AlterTable
ALTER TABLE "group_predictions" ADD COLUMN     "fourth_place_team_id" TEXT,
ADD COLUMN     "third_place_team_id" TEXT;

-- AddForeignKey
ALTER TABLE "group_predictions" ADD CONSTRAINT "group_predictions_third_place_team_id_fkey" FOREIGN KEY ("third_place_team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_predictions" ADD CONSTRAINT "group_predictions_fourth_place_team_id_fkey" FOREIGN KEY ("fourth_place_team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;
