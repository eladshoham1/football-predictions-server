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
exports.LeaderboardService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let LeaderboardService = class LeaderboardService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async get() {
        const users = await this.prisma.user.findMany({ include: { matchPredictions: true } });
        const rows = users.map((u) => {
            const points = u.matchPredictions.reduce((s, p) => s + (p.pointsAwarded || 0), 0);
            const exactCount = u.matchPredictions.filter((p) => p.pointsAwarded >= 5).length;
            const scoringCount = u.matchPredictions.filter((p) => p.pointsAwarded >= 2).length;
            return { userId: u.id, name: u.name, avatarUrl: u.avatarUrl, points, exactCount, scoringCount };
        });
        rows.sort((a, b) => b.points - a.points);
        let rank = 0;
        let last = null;
        for (let i = 0; i < rows.length; i++) {
            if (last === null || rows[i].points < last) {
                rank = i + 1;
                last = rows[i].points;
            }
            rows[i].rank = rank;
        }
        return rows;
    }
};
exports.LeaderboardService = LeaderboardService;
exports.LeaderboardService = LeaderboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LeaderboardService);
//# sourceMappingURL=leaderboard.service.js.map