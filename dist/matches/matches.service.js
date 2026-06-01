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
exports.MatchesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let MatchesService = class MatchesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async list() {
        return this.prisma.match.findMany({ include: { homeTeam: true, awayTeam: true } });
    }
    async listEnriched() {
        const matches = await this.prisma.match.findMany({ include: { homeTeam: true, awayTeam: true } });
        return matches.map((m) => ({
            id: m.id,
            kickoffTime: m.kickoffTime,
            stage: m.stage,
            status: m.status,
            homeTeam: { id: m.homeTeam.id, name: m.homeTeam.name, code: m.homeTeam.code, flagUrl: m.homeTeam.flagUrl },
            awayTeam: { id: m.awayTeam.id, name: m.awayTeam.name, code: m.awayTeam.code, flagUrl: m.awayTeam.flagUrl },
            homeScore: m.homeScore,
            awayScore: m.awayScore,
        }));
    }
};
exports.MatchesService = MatchesService;
exports.MatchesService = MatchesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MatchesService);
//# sourceMappingURL=matches.service.js.map