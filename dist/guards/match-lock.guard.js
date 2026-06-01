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
exports.MatchLockGuard = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let MatchLockGuard = class MatchLockGuard {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async canActivate(context) {
        var _a, _b;
        const request = context.switchToHttp().getRequest();
        const matchId = ((_a = request.body) === null || _a === void 0 ? void 0 : _a.matchId) || ((_b = request.params) === null || _b === void 0 ? void 0 : _b.matchId);
        if (!matchId) {
            throw new common_1.ForbiddenException('Match ID is required');
        }
        const match = await this.prisma.match.findUnique({
            where: { id: matchId },
            select: { kickoffTime: true, status: true },
        });
        if (!match) {
            throw new common_1.ForbiddenException('Match not found');
        }
        const now = new Date();
        const kickoff = new Date(match.kickoffTime);
        if (now >= kickoff) {
            throw new common_1.ForbiddenException('Predictions are locked after match kickoff');
        }
        if (match.status !== 'SCHEDULED') {
            throw new common_1.ForbiddenException('Predictions are locked for non-scheduled matches');
        }
        return true;
    }
};
exports.MatchLockGuard = MatchLockGuard;
exports.MatchLockGuard = MatchLockGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MatchLockGuard);
//# sourceMappingURL=match-lock.guard.js.map