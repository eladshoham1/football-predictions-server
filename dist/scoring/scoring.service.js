"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ScoringService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScoringService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let ScoringService = ScoringService_1 = class ScoringService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(ScoringService_1.name);
    }
    async calculateMatchPoints(matchId) {
        const match = await this.prisma.match.findUnique({
            where: { id: matchId },
            include: { predictions: true },
        });
        if (!match || match.status !== client_1.MatchStatus.FINISHED) {
            this.logger.warn(`Match ${matchId} not finished, skipping scoring`);
            return 0;
        }
        if (match.homeScore === null || match.awayScore === null) {
            this.logger.warn(`Match ${matchId} has no scores, skipping`);
            return 0;
        }
        const config = await this.prisma.scoringConfig.findUnique({ where: { id: 'default' } });
        if (!config) {
            throw new Error('Scoring configuration not found');
        }
        let updated = 0;
        for (const pred of match.predictions) {
            const points = this.computeMatchPoints(pred.predictedHomeScore, pred.predictedAwayScore, match.homeScore, match.awayScore, config);
            await this.prisma.matchPrediction.update({
                where: { id: pred.id },
                data: { pointsAwarded: points },
            });
            updated++;
        }
        this.logger.log(`Scored ${updated} predictions for match ${matchId}`);
        return updated;
    }
    computeMatchPoints(predHome, predAway, actualHome, actualAway, config) {
        if (predHome === actualHome && predAway === actualAway) {
            return config.exactScore;
        }
        const predDiff = predHome - predAway;
        const actualDiff = actualHome - actualAway;
        if (predDiff === actualDiff) {
            return config.correctGoalDifference;
        }
        const predWinner = predDiff > 0 ? 'home' : predDiff < 0 ? 'away' : 'draw';
        const actualWinner = actualDiff > 0 ? 'home' : actualDiff < 0 ? 'away' : 'draw';
        if (predWinner === actualWinner) {
            return config.correctWinner;
        }
        return 0;
    }
    async calculateGroupPoints(groupName) {
        const config = await this.prisma.scoringConfig.findUnique({ where: { id: 'default' } });
        if (!config) {
            throw new Error('Scoring configuration not found');
        }
        const teams = await this.prisma.team.findMany({
            where: { groupName },
            include: {
                homeMatches: {
                    where: { status: client_1.MatchStatus.FINISHED },
                },
                awayMatches: {
                    where: { status: client_1.MatchStatus.FINISHED },
                },
            },
        });
        const standings = teams.map((team) => {
            let points = 0;
            let gd = 0;
            for (const match of team.homeMatches) {
                if (match.homeScore === null || match.awayScore === null)
                    continue;
                if (match.homeScore > match.awayScore)
                    points += 3;
                else if (match.homeScore === match.awayScore)
                    points += 1;
                gd += match.homeScore - match.awayScore;
            }
            for (const match of team.awayMatches) {
                if (match.homeScore === null || match.awayScore === null)
                    continue;
                if (match.awayScore > match.homeScore)
                    points += 3;
                else if (match.homeScore === match.awayScore)
                    points += 1;
                gd += match.awayScore - match.homeScore;
            }
            return { teamId: team.id, points, gd };
        });
        standings.sort((a, b) => {
            if (b.points !== a.points)
                return b.points - a.points;
            return b.gd - a.gd;
        });
        const advancingTeams = standings.slice(0, 2).map((s) => s.teamId);
        const predictions = await this.prisma.groupPrediction.findMany({
            where: { groupName },
        });
        let updated = 0;
        for (const pred of predictions) {
            let points = 0;
            const firstAdvanced = advancingTeams.includes(pred.firstPlaceTeamId);
            const secondAdvanced = advancingTeams.includes(pred.secondPlaceTeamId);
            if (firstAdvanced)
                points += config.groupAdvancingTeam;
            if (secondAdvanced)
                points += config.groupAdvancingTeam;
            if (pred.firstPlaceTeamId === advancingTeams[0]) {
                points += config.groupCorrectPosition;
            }
            if (pred.secondPlaceTeamId === advancingTeams[1]) {
                points += config.groupCorrectPosition;
            }
            await this.prisma.groupPrediction.update({
                where: { id: pred.id },
                data: { pointsAwarded: points },
            });
            updated++;
        }
        this.logger.log(`Scored ${updated} group predictions for ${groupName}`);
        return updated;
    }
    async calculateBracketPoints(matchId) {
        const match = await this.prisma.match.findUnique({
            where: { id: matchId },
            include: {
                homeTeam: true,
                awayTeam: true,
            },
        });
        if (!match || match.status !== client_1.MatchStatus.FINISHED) {
            return 0;
        }
        const config = await this.prisma.scoringConfig.findUnique({ where: { id: 'default' } });
        if (!config) {
            throw new Error('Scoring configuration not found');
        }
        let winnerTeamId = null;
        if (match.homeScore !== null && match.awayScore !== null) {
            if (match.homeScore > match.awayScore) {
                winnerTeamId = match.homeTeamId;
            }
            else if (match.awayScore > match.homeScore) {
                winnerTeamId = match.awayTeamId;
            }
            else if (match.penaltyWinnerId) {
                winnerTeamId = match.penaltyWinnerId;
            }
        }
        if (!winnerTeamId) {
            this.logger.warn(`No winner determined for match ${matchId}`);
            return 0;
        }
        const stagePoints = {
            ROUND_OF_32: config.roundOf32,
            ROUND_OF_16: config.roundOf16,
            QUARTER_FINAL: config.quarterFinal,
            SEMI_FINAL: config.semiFinal,
            FINAL: config.final,
        };
        const points = stagePoints[match.stage] || 0;
        const predictions = await this.prisma.bracketPrediction.findMany({
            where: { matchId },
        });
        let updated = 0;
        for (const pred of predictions) {
            const awarded = pred.predictedTeamId === winnerTeamId ? points : 0;
            await this.prisma.bracketPrediction.update({
                where: { id: pred.id },
                data: { pointsAwarded: awarded },
            });
            updated++;
        }
        this.logger.log(`Scored ${updated} bracket predictions for match ${matchId}`);
        return updated;
    }
    async calculateTournamentPoints() {
        const config = await this.prisma.scoringConfig.findUnique({ where: { id: 'default' } });
        if (!config) {
            throw new Error('Scoring configuration not found');
        }
        const finalMatch = await this.prisma.match.findFirst({
            where: { stage: 'FINAL', status: client_1.MatchStatus.FINISHED },
        });
        if (!finalMatch) {
            this.logger.warn('Final match not finished yet');
            return 0;
        }
        let winnerTeamId = null;
        if (finalMatch.homeScore !== null && finalMatch.awayScore !== null) {
            if (finalMatch.homeScore > finalMatch.awayScore) {
                winnerTeamId = finalMatch.homeTeamId;
            }
            else if (finalMatch.awayScore > finalMatch.homeScore) {
                winnerTeamId = finalMatch.awayTeamId;
            }
            else if (finalMatch.penaltyWinnerId) {
                winnerTeamId = finalMatch.penaltyWinnerId;
            }
        }
        if (!winnerTeamId) {
            this.logger.warn('No tournament winner determined');
            return 0;
        }
        const goldenBootPlayerId = null;
        const predictions = await this.prisma.tournamentPrediction.findMany();
        let updated = 0;
        for (const pred of predictions) {
            let winnerPoints = 0;
            let goldenBootPoints = 0;
            if (pred.winnerTeamId === winnerTeamId) {
                winnerPoints = config.tournamentWinner;
            }
            if (goldenBootPlayerId && pred.goldenBootPlayerId === goldenBootPlayerId) {
                goldenBootPoints = config.goldenBoot;
            }
            await this.prisma.tournamentPrediction.update({
                where: { id: pred.id },
                data: { winnerPointsAwarded: winnerPoints, goldenBootPointsAwarded: goldenBootPoints },
            });
            updated++;
        }
        this.logger.log(`Scored ${updated} tournament predictions`);
        return updated;
    }
    async recalculateUserPoints(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                matchPredictions: { include: { match: true } },
                groupPredictions: true,
                bracketPredictions: true,
                tournamentPredictions: true,
            },
        });
        if (!user) {
            throw new Error('User not found');
        }
        const config = await this.prisma.scoringConfig.findUnique({ where: { id: 'default' } });
        if (!config) {
            throw new Error('Scoring configuration not found');
        }
        for (const pred of user.matchPredictions) {
            if (pred.match.status === client_1.MatchStatus.FINISHED && pred.match.homeScore !== null && pred.match.awayScore !== null) {
                const points = this.computeMatchPoints(pred.predictedHomeScore, pred.predictedAwayScore, pred.match.homeScore, pred.match.awayScore, config);
                await this.prisma.matchPrediction.update({
                    where: { id: pred.id },
                    data: { pointsAwarded: points },
                });
            }
        }
        this.logger.log(`Recalculated points for user ${userId}`);
    }
};
exports.ScoringService = ScoringService;
exports.ScoringService = ScoringService = ScoringService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ScoringService);
//# sourceMappingURL=scoring.service.js.map