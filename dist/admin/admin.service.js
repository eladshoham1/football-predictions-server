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
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const scoring_service_1 = require("../scoring/scoring.service");
let AdminService = class AdminService {
    constructor(prisma, scoringService) {
        this.prisma = prisma;
        this.scoringService = scoringService;
    }
    async getAllUsers() {
        return this.prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
                role: true,
                createdAt: true,
                lastLoginAt: true,
                _count: {
                    select: {
                        matchPredictions: true,
                        groupPredictions: true,
                        bracketPredictions: true,
                        tournamentPredictions: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async updateUserRole(userId, role) {
        return this.prisma.user.update({
            where: { id: userId },
            data: { role },
        });
    }
    async deleteUser(userId) {
        return this.prisma.user.delete({
            where: { id: userId },
        });
    }
    async getScoringConfig() {
        return this.prisma.scoringConfig.findUnique({
            where: { id: 'default' },
        });
    }
    async updateScoringConfig(data) {
        return this.prisma.scoringConfig.update({
            where: { id: 'default' },
            data,
        });
    }
    async calculateMatchPoints(matchId) {
        const count = await this.scoringService.calculateMatchPoints(matchId);
        return { success: true, updatedPredictions: count };
    }
    async calculateGroupPoints(groupName) {
        const count = await this.scoringService.calculateGroupPoints(groupName);
        return { success: true, updatedPredictions: count };
    }
    async calculateBracketPoints(matchId) {
        const count = await this.scoringService.calculateBracketPoints(matchId);
        return { success: true, updatedPredictions: count };
    }
    async calculateTournamentPoints() {
        const count = await this.scoringService.calculateTournamentPoints();
        return { success: true, updatedPredictions: count };
    }
    async recalculateUserPoints(userId) {
        await this.scoringService.recalculateUserPoints(userId);
        return { success: true };
    }
    async getStats() {
        const [totalUsers, totalMatches, totalPredictions, finishedMatches] = await Promise.all([
            this.prisma.user.count(),
            this.prisma.match.count(),
            this.prisma.matchPrediction.count(),
            this.prisma.match.count({ where: { status: 'FINISHED' } }),
        ]);
        return {
            totalUsers,
            totalMatches,
            totalPredictions,
            finishedMatches,
            upcomingMatches: totalMatches - finishedMatches,
        };
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        scoring_service_1.ScoringService])
], AdminService);
//# sourceMappingURL=admin.service.js.map