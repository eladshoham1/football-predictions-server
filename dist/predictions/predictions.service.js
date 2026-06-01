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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PredictionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let PredictionsService = class PredictionsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async upsertForUser(userId, payload) {
        const existing = await this.prisma.matchPrediction.findFirst({ where: { userId, matchId: payload.matchId } });
        if (existing) {
            return this.prisma.matchPrediction.update({ where: { id: existing.id }, data: { predictedHomeScore: payload.homeScore, predictedAwayScore: payload.awayScore } });
        }
        return this.prisma.matchPrediction.create({ data: { userId, matchId: payload.matchId, predictedHomeScore: payload.homeScore, predictedAwayScore: payload.awayScore } });
    }
    async forUserId(userId) {
        return this.prisma.matchPrediction.findMany({ where: { userId }, include: { match: { include: { homeTeam: true, awayTeam: true } } } });
    }
    async upsertGroupPrediction(userId, payload) {
        const firstTournamentMatch = await this.prisma.match.findFirst({
            where: {
                stage: 'GROUP_STAGE'
            },
            orderBy: { kickoffTime: 'asc' }
        });
        if (firstTournamentMatch) {
            const lockTime = new Date(firstTournamentMatch.kickoffTime.getTime() - 30 * 60 * 1000);
            if (new Date() >= lockTime) {
                throw new common_1.UnauthorizedException('ניחושי שלב הקבוצות נעולים 30 דקות לפני תחילת הטורניר');
            }
        }
        const existing = await this.prisma.groupPrediction.findFirst({ where: { userId, groupName: payload.groupName } });
        if (existing) {
            return this.prisma.groupPrediction.update({
                where: { id: existing.id },
                data: {
                    firstPlaceTeamId: payload.firstPlaceTeamId,
                    secondPlaceTeamId: payload.secondPlaceTeamId,
                    thirdPlaceTeamId: payload.thirdPlaceTeamId || null,
                    fourthPlaceTeamId: payload.fourthPlaceTeamId || null
                },
            });
        }
        return this.prisma.groupPrediction.create({
            data: {
                userId,
                groupName: payload.groupName,
                firstPlaceTeamId: payload.firstPlaceTeamId,
                secondPlaceTeamId: payload.secondPlaceTeamId,
                thirdPlaceTeamId: payload.thirdPlaceTeamId || null,
                fourthPlaceTeamId: payload.fourthPlaceTeamId || null
            },
        });
    }
    async getUserGroupPredictions(userId) {
        return this.prisma.groupPrediction.findMany({
            where: { userId },
            include: {
                firstPlaceTeam: true,
                secondPlaceTeam: true,
                thirdPlaceTeam: true,
                fourthPlaceTeam: true
            },
        });
    }
    async upsertGroupPredictions(userId, predictions) {
        const firstTournamentMatch = await this.prisma.match.findFirst({
            where: {
                stage: 'GROUP_STAGE'
            },
            orderBy: { kickoffTime: 'asc' }
        });
        if (firstTournamentMatch) {
            const lockTime = new Date(firstTournamentMatch.kickoffTime.getTime() - 30 * 60 * 1000);
            const isLocked = new Date() >= lockTime;
            if (isLocked) {
                throw new common_1.UnauthorizedException('ניחושי שלב הקבוצות נעולים 30 דקות לפני תחילת הטורניר');
            }
        }
        return this.prisma.$transaction(predictions.map((pred) => this.prisma.groupPrediction.upsert({
            where: {
                userId_groupName: {
                    userId,
                    groupName: pred.groupName
                }
            },
            create: {
                userId,
                groupName: pred.groupName,
                firstPlaceTeamId: pred.firstPlaceTeamId,
                secondPlaceTeamId: pred.secondPlaceTeamId,
                thirdPlaceTeamId: pred.thirdPlaceTeamId || null,
                fourthPlaceTeamId: pred.fourthPlaceTeamId || null
            },
            update: {
                firstPlaceTeamId: pred.firstPlaceTeamId,
                secondPlaceTeamId: pred.secondPlaceTeamId,
                thirdPlaceTeamId: pred.thirdPlaceTeamId || null,
                fourthPlaceTeamId: pred.fourthPlaceTeamId || null
            }
        })));
    }
    async upsertBracketPrediction(userId, payload) {
        const existing = await this.prisma.bracketPrediction.findFirst({ where: { userId, matchId: payload.matchId } });
        if (existing) {
            return this.prisma.bracketPrediction.update({
                where: { id: existing.id },
                data: { predictedTeamId: payload.predictedWinnerTeamId },
            });
        }
        return this.prisma.bracketPrediction.create({
            data: { userId, matchId: payload.matchId, predictedTeamId: payload.predictedWinnerTeamId },
        });
    }
    async getUserBracketPredictions(userId) {
        return this.prisma.bracketPrediction.findMany({
            where: { userId },
            include: { predictedTeam: true },
        });
    }
    async upsertBracketPredictions(userId, payload) {
        const requiredStages = {
            R32: 16,
            R16: 8,
            QF: 4,
            SF: 2,
        };
        const stageCounts = {};
        payload.bracketPredictions.forEach(pred => {
            const stage = pred.matchId.split('_')[0];
            stageCounts[stage] = (stageCounts[stage] || 0) + 1;
        });
        const missingStages = [];
        Object.entries(requiredStages).forEach(([stage, required]) => {
            const count = stageCounts[stage] || 0;
            if (count < required) {
                const stageNames = {
                    R32: 'שלב 32',
                    R16: 'שמינית גמר',
                    QF: 'רבע גמר',
                    SF: 'חצי גמר'
                };
                missingStages.push(`${stageNames[stage]} (${count}/${required})`);
            }
        });
        if (!payload.tournamentWinnerId) {
            missingStages.push('זוכה הטורניר (גמר)');
        }
        if (!payload.thirdPlaceWinnerId) {
            missingStages.push('מקום 3');
        }
        if (missingStages.length > 0) {
            throw new common_1.UnauthorizedException(`יש להשלים את כל השלבים לפני השמירה:\n${missingStages.join('\n')}`);
        }
        return this.prisma.$transaction(async (tx) => {
            const bracketPromises = payload.bracketPredictions.map(pred => tx.bracketPrediction.upsert({
                where: {
                    userId_matchId: {
                        userId,
                        matchId: pred.matchId
                    }
                },
                create: {
                    userId,
                    matchId: pred.matchId,
                    predictedTeamId: pred.predictedWinnerTeamId
                },
                update: {
                    predictedTeamId: pred.predictedWinnerTeamId
                }
            }));
            const thirdPlacePromise = tx.bracketPrediction.upsert({
                where: {
                    userId_matchId: {
                        userId,
                        matchId: 'THIRD_PLACE'
                    }
                },
                create: {
                    userId,
                    matchId: 'THIRD_PLACE',
                    predictedTeamId: payload.thirdPlaceWinnerId
                },
                update: {
                    predictedTeamId: payload.thirdPlaceWinnerId
                }
            });
            const tournamentPromise = tx.tournamentPrediction.upsert({
                where: {
                    userId
                },
                create: {
                    userId,
                    winnerTeamId: payload.tournamentWinnerId
                },
                update: {
                    winnerTeamId: payload.tournamentWinnerId
                }
            });
            await Promise.all([...bracketPromises, thirdPlacePromise, tournamentPromise]);
            return { success: true, message: 'ניחושי הפלייאוף נשמרו בהצלחה!' };
        });
    }
    async upsertTournamentPrediction(userId, payload) {
        const existing = await this.prisma.tournamentPrediction.findFirst({ where: { userId } });
        if (existing) {
            return this.prisma.tournamentPrediction.update({
                where: { id: existing.id },
                data: { winnerTeamId: payload.winnerTeamId, goldenBootPlayerId: payload.goldenBootPlayerId || undefined },
            });
        }
        return this.prisma.tournamentPrediction.create({
            data: { userId, winnerTeamId: payload.winnerTeamId, goldenBootPlayerId: payload.goldenBootPlayerId },
        });
    }
    async getUserTournamentPrediction(userId) {
        return this.prisma.tournamentPrediction.findFirst({
            where: { userId },
            include: { winnerTeam: true, goldenBootPlayer: true },
        });
    }
    async getGroupLockStatus(groupName) {
        const firstTournamentMatch = await this.prisma.match.findFirst({
            where: {
                stage: 'GROUP_STAGE'
            },
            orderBy: { kickoffTime: 'asc' }
        });
        if (!firstTournamentMatch) {
            return { isLocked: false, lockTime: null, firstMatchTime: null };
        }
        const lockTime = new Date(firstTournamentMatch.kickoffTime.getTime() - 30 * 60 * 1000);
        const isLocked = new Date() >= lockTime;
        return { isLocked, lockTime, firstMatchTime: firstTournamentMatch.kickoffTime };
    }
};
exports.PredictionsService = PredictionsService;
exports.PredictionsService = PredictionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PredictionsService);
//# sourceMappingURL=predictions.service.js.map