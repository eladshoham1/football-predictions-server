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
exports.WorldcupController = void 0;
const common_1 = require("@nestjs/common");
const worldcup_service_1 = require("./worldcup.service");
const auth_service_1 = require("../auth/auth.service");
let WorldcupController = class WorldcupController {
    constructor(worldcupService, authService) {
        this.worldcupService = worldcupService;
        this.authService = authService;
    }
    async syncMatches(req) {
        const user = await this.getUserFromRequest(req);
        if (!user || user.role !== 'ADMIN') {
            throw new common_1.UnauthorizedException('Admin access required');
        }
        return await this.worldcupService.syncMatches();
    }
    async syncMatchesDev() {
        return await this.worldcupService.syncMatches();
    }
    async getSyncLogs(req) {
        const user = await this.getUserFromRequest(req);
        if (!user || user.role !== 'ADMIN') {
            throw new common_1.UnauthorizedException('Admin access required');
        }
        return await this.worldcupService.getSyncLogs();
    }
    async getUserFromRequest(req) {
        const auth = req.headers.authorization;
        if (!auth)
            return null;
        const token = auth.replace(/^Bearer\s+/, '');
        return await this.authService.verifyToken(token);
    }
};
exports.WorldcupController = WorldcupController;
__decorate([
    (0, common_1.Post)('sync'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WorldcupController.prototype, "syncMatches", null);
__decorate([
    (0, common_1.Post)('sync-dev'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WorldcupController.prototype, "syncMatchesDev", null);
__decorate([
    (0, common_1.Get)('sync-logs'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WorldcupController.prototype, "getSyncLogs", null);
exports.WorldcupController = WorldcupController = __decorate([
    (0, common_1.Controller)('worldcup'),
    __metadata("design:paramtypes", [worldcup_service_1.WorldcupService,
        auth_service_1.AuthService])
], WorldcupController);
//# sourceMappingURL=worldcup.controller.js.map