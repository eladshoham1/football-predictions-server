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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PredictionsController = void 0;
const common_1 = require("@nestjs/common");
const predictions_service_1 = require("./predictions.service");
const auth_service_1 = require("../auth/auth.service");
const match_lock_guard_1 = require("../guards/match-lock.guard");
let PredictionsController = class PredictionsController {
    constructor(svc, authService) {
        this.svc = svc;
        this.authService = authService;
    }
    async upsertMatch(req, body) {
        const auth = req.headers.authorization;
        const token = auth ? auth.replace(/^Bearer\s+/, '') : null;
        const user = await this.authService.verifyToken(token || '');
        if (!user)
            throw new common_1.UnauthorizedException();
        return this.svc.upsertForUser(user.id, body);
    }
    async myMatches(req) {
        const auth = req.headers.authorization;
        const token = auth ? auth.replace(/^Bearer\s+/, '') : null;
        const user = await this.authService.verifyToken(token || '');
        if (!user)
            throw new common_1.UnauthorizedException();
        return this.svc.forUserId(user.id);
    }
    async upsertGroup(req, body) {
        const auth = req.headers.authorization;
        const token = auth ? auth.replace(/^Bearer\s+/, '') : null;
        const user = await this.authService.verifyToken(token || '');
        if (!user)
            throw new common_1.UnauthorizedException();
        return this.svc.upsertGroupPrediction(user.id, body);
    }
    async myGroups(req) {
        const auth = req.headers.authorization;
        const token = auth ? auth.replace(/^Bearer\s+/, '') : null;
        const user = await this.authService.verifyToken(token || '');
        if (!user)
            throw new common_1.UnauthorizedException();
        return this.svc.getUserGroupPredictions(user.id);
    }
    async upsertBracket(req, body) {
        const auth = req.headers.authorization;
        const token = auth ? auth.replace(/^Bearer\s+/, '') : null;
        const user = await this.authService.verifyToken(token || '');
        if (!user)
            throw new common_1.UnauthorizedException();
        return this.svc.upsertBracketPrediction(user.id, body);
    }
    async myBrackets(req) {
        const auth = req.headers.authorization;
        const token = auth ? auth.replace(/^Bearer\s+/, '') : null;
        const user = await this.authService.verifyToken(token || '');
        if (!user)
            throw new common_1.UnauthorizedException();
        return this.svc.getUserBracketPredictions(user.id);
    }
    async upsertBrackets(req, body) {
        const auth = req.headers.authorization;
        const token = auth ? auth.replace(/^Bearer\s+/, '') : null;
        const user = await this.authService.verifyToken(token || '');
        if (!user)
            throw new common_1.UnauthorizedException();
        return this.svc.upsertBracketPredictions(user.id, body);
    }
    async upsertTournament(req, body) {
        const auth = req.headers.authorization;
        const token = auth ? auth.replace(/^Bearer\s+/, '') : null;
        const user = await this.authService.verifyToken(token || '');
        if (!user)
            throw new common_1.UnauthorizedException();
        return this.svc.upsertTournamentPrediction(user.id, body);
    }
    async myTournament(req) {
        const auth = req.headers.authorization;
        const token = auth ? auth.replace(/^Bearer\s+/, '') : null;
        const user = await this.authService.verifyToken(token || '');
        if (!user)
            throw new common_1.UnauthorizedException();
        return this.svc.getUserTournamentPrediction(user.id);
    }
    async upsertGroups(req, body) {
        const auth = req.headers.authorization;
        const token = auth ? auth.replace(/^Bearer\s+/, '') : null;
        const user = await this.authService.verifyToken(token || '');
        if (!user)
            throw new common_1.UnauthorizedException();
        return this.svc.upsertGroupPredictions(user.id, body.predictions);
    }
    async getGroupsLockStatus() {
        const groups = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
        const statusPromises = groups.map(async (groupName) => {
            const status = await this.svc.getGroupLockStatus(groupName);
            return { groupName, ...status };
        });
        return Promise.all(statusPromises);
    }
};
exports.PredictionsController = PredictionsController;
__decorate([
    (0, common_1.Post)('match'),
    (0, common_1.UseGuards)(match_lock_guard_1.MatchLockGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PredictionsController.prototype, "upsertMatch", null);
__decorate([
    (0, common_1.Get)('match'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PredictionsController.prototype, "myMatches", null);
__decorate([
    (0, common_1.Post)('group'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PredictionsController.prototype, "upsertGroup", null);
__decorate([
    (0, common_1.Get)('group'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PredictionsController.prototype, "myGroups", null);
__decorate([
    (0, common_1.Post)('bracket'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PredictionsController.prototype, "upsertBracket", null);
__decorate([
    (0, common_1.Get)('bracket'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PredictionsController.prototype, "myBrackets", null);
__decorate([
    (0, common_1.Post)('brackets'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PredictionsController.prototype, "upsertBrackets", null);
__decorate([
    (0, common_1.Post)('tournament'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PredictionsController.prototype, "upsertTournament", null);
__decorate([
    (0, common_1.Get)('tournament'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PredictionsController.prototype, "myTournament", null);
__decorate([
    (0, common_1.Post)('groups'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PredictionsController.prototype, "upsertGroups", null);
__decorate([
    (0, common_1.Get)('group-lock-status'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PredictionsController.prototype, "getGroupsLockStatus", null);
exports.PredictionsController = PredictionsController = __decorate([
    (0, common_1.Controller)('predictions'),
    __metadata("design:paramtypes", [predictions_service_1.PredictionsService, auth_service_1.AuthService])
], PredictionsController);
//# sourceMappingURL=predictions.controller.js.map