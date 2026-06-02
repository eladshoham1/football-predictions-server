-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "MatchStatus" AS ENUM ('SCHEDULED', 'LIVE', 'FINISHED', 'POSTPONED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "MatchStage" AS ENUM ('GROUP_STAGE', 'ROUND_OF_32', 'ROUND_OF_16', 'QUARTER_FINAL', 'SEMI_FINAL', 'THIRD_PLACE', 'FINAL');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "google_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "avatar_url" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_login_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teams" (
    "id" TEXT NOT NULL,
    "external_api_id" TEXT,
    "name" TEXT NOT NULL,
    "hebrew_name" TEXT,
    "code" TEXT NOT NULL,
    "flag_url" TEXT,
    "group_name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "players" (
    "id" TEXT NOT NULL,
    "external_api_id" TEXT,
    "team_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "position" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "players_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "matches" (
    "id" TEXT NOT NULL,
    "external_api_id" TEXT,
    "stage" "MatchStage" NOT NULL,
    "round" INTEGER,
    "group_name" TEXT,
    "home_team_id" TEXT NOT NULL,
    "away_team_id" TEXT NOT NULL,
    "kickoff_time" TIMESTAMP(3) NOT NULL,
    "home_score" INTEGER,
    "away_score" INTEGER,
    "penalty_winner_id" TEXT,
    "status" "MatchStatus" NOT NULL DEFAULT 'SCHEDULED',
    "venue" TEXT,
    "is_synced" BOOLEAN NOT NULL DEFAULT false,
    "synced_at" TIMESTAMP(3),
    "actual_first_goal_scorer_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "match_predictions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "match_id" TEXT NOT NULL,
    "predicted_home_score" INTEGER NOT NULL,
    "predicted_away_score" INTEGER NOT NULL,
    "first_goal_scorer_id" TEXT,
    "points_awarded" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "match_predictions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "group_predictions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "group_name" TEXT NOT NULL,
    "first_place_team_id" TEXT NOT NULL,
    "second_place_team_id" TEXT NOT NULL,
    "third_place_team_id" TEXT,
    "fourth_place_team_id" TEXT,
    "points_awarded" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "group_predictions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bracket_predictions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "match_id" TEXT NOT NULL,
    "predicted_team_id" TEXT NOT NULL,
    "points_awarded" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bracket_predictions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tournament_predictions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "winner_team_id" TEXT NOT NULL,
    "golden_boot_player_id" TEXT,
    "winner_points_awarded" INTEGER NOT NULL DEFAULT 0,
    "golden_boot_points_awarded" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tournament_predictions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scoring_config" (
    "id" TEXT NOT NULL,
    "correct_winner" INTEGER NOT NULL DEFAULT 3,
    "correct_goal_difference" INTEGER NOT NULL DEFAULT 2,
    "exact_score" INTEGER NOT NULL DEFAULT 5,
    "group_advancing_team" INTEGER NOT NULL DEFAULT 5,
    "group_correct_position" INTEGER NOT NULL DEFAULT 10,
    "round_of_32" INTEGER NOT NULL DEFAULT 2,
    "round_of_16" INTEGER NOT NULL DEFAULT 4,
    "quarter_final" INTEGER NOT NULL DEFAULT 8,
    "semi_final" INTEGER NOT NULL DEFAULT 12,
    "final" INTEGER NOT NULL DEFAULT 20,
    "tournament_winner" INTEGER NOT NULL DEFAULT 30,
    "golden_boot" INTEGER NOT NULL DEFAULT 25,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scoring_config_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_google_id_key" ON "users"("google_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "teams_external_api_id_key" ON "teams"("external_api_id");

-- CreateIndex
CREATE UNIQUE INDEX "teams_code_key" ON "teams"("code");

-- CreateIndex
CREATE UNIQUE INDEX "players_external_api_id_key" ON "players"("external_api_id");

-- CreateIndex
CREATE INDEX "players_team_id_idx" ON "players"("team_id");

-- CreateIndex
CREATE INDEX "players_external_api_id_idx" ON "players"("external_api_id");

-- CreateIndex
CREATE UNIQUE INDEX "matches_external_api_id_key" ON "matches"("external_api_id");

-- CreateIndex
CREATE INDEX "matches_kickoff_time_idx" ON "matches"("kickoff_time");

-- CreateIndex
CREATE INDEX "matches_stage_idx" ON "matches"("stage");

-- CreateIndex
CREATE INDEX "matches_status_idx" ON "matches"("status");

-- CreateIndex
CREATE INDEX "matches_is_synced_idx" ON "matches"("is_synced");

-- CreateIndex
CREATE INDEX "match_predictions_user_id_idx" ON "match_predictions"("user_id");

-- CreateIndex
CREATE INDEX "match_predictions_match_id_idx" ON "match_predictions"("match_id");

-- CreateIndex
CREATE INDEX "match_predictions_first_goal_scorer_id_idx" ON "match_predictions"("first_goal_scorer_id");

-- CreateIndex
CREATE UNIQUE INDEX "match_predictions_user_id_match_id_key" ON "match_predictions"("user_id", "match_id");

-- CreateIndex
CREATE INDEX "group_predictions_user_id_idx" ON "group_predictions"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "group_predictions_user_id_group_name_key" ON "group_predictions"("user_id", "group_name");

-- CreateIndex
CREATE INDEX "bracket_predictions_user_id_idx" ON "bracket_predictions"("user_id");

-- CreateIndex
CREATE INDEX "bracket_predictions_match_id_idx" ON "bracket_predictions"("match_id");

-- CreateIndex
CREATE UNIQUE INDEX "bracket_predictions_user_id_match_id_key" ON "bracket_predictions"("user_id", "match_id");

-- CreateIndex
CREATE UNIQUE INDEX "tournament_predictions_user_id_key" ON "tournament_predictions"("user_id");

-- AddForeignKey
ALTER TABLE "players" ADD CONSTRAINT "players_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_home_team_id_fkey" FOREIGN KEY ("home_team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_away_team_id_fkey" FOREIGN KEY ("away_team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_actual_first_goal_scorer_id_fkey" FOREIGN KEY ("actual_first_goal_scorer_id") REFERENCES "players"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_predictions" ADD CONSTRAINT "match_predictions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_predictions" ADD CONSTRAINT "match_predictions_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_predictions" ADD CONSTRAINT "match_predictions_first_goal_scorer_id_fkey" FOREIGN KEY ("first_goal_scorer_id") REFERENCES "players"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_predictions" ADD CONSTRAINT "group_predictions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_predictions" ADD CONSTRAINT "group_predictions_first_place_team_id_fkey" FOREIGN KEY ("first_place_team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_predictions" ADD CONSTRAINT "group_predictions_second_place_team_id_fkey" FOREIGN KEY ("second_place_team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_predictions" ADD CONSTRAINT "group_predictions_third_place_team_id_fkey" FOREIGN KEY ("third_place_team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_predictions" ADD CONSTRAINT "group_predictions_fourth_place_team_id_fkey" FOREIGN KEY ("fourth_place_team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bracket_predictions" ADD CONSTRAINT "bracket_predictions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bracket_predictions" ADD CONSTRAINT "bracket_predictions_predicted_team_id_fkey" FOREIGN KEY ("predicted_team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournament_predictions" ADD CONSTRAINT "tournament_predictions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournament_predictions" ADD CONSTRAINT "tournament_predictions_winner_team_id_fkey" FOREIGN KEY ("winner_team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournament_predictions" ADD CONSTRAINT "tournament_predictions_golden_boot_player_id_fkey" FOREIGN KEY ("golden_boot_player_id") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;
