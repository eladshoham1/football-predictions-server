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
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const admin_service_1 = require("./admin.service");
const admin_guard_1 = require("../guards/admin.guard");
const auth_service_1 = require("../auth/auth.service");
let AdminController = class AdminController {
    constructor(adminService, authService) {
        this.adminService = adminService;
        this.authService = authService;
    }
    async authenticateAdmin(req) {
        const auth = req.headers.authorization;
        const token = auth ? auth.replace(/^Bearer\s+/, '') : null;
        const user = await this.authService.verifyToken(token || '');
        if (!user)
            throw new common_1.UnauthorizedException();
        return user;
    }
    async getAllUsers(req) {
        await this.authenticateAdmin(req);
        return this.adminService.getAllUsers();
    }
    async updateUserRole(req, userId, body) {
        await this.authenticateAdmin(req);
        return this.adminService.updateUserRole(userId, body.role);
    }
    async deleteUser(req, userId) {
        await this.authenticateAdmin(req);
        return this.adminService.deleteUser(userId);
    }
    async getScoringConfig(req) {
        await this.authenticateAdmin(req);
        return this.adminService.getScoringConfig();
    }
    async updateScoringConfig(req, body) {
        await this.authenticateAdmin(req);
        return this.adminService.updateScoringConfig(body);
    }
    async calculateMatchPoints(req, matchId) {
        await this.authenticateAdmin(req);
        return this.adminService.calculateMatchPoints(matchId);
    }
    async calculateGroupPoints(req, groupName) {
        await this.authenticateAdmin(req);
        return this.adminService.calculateGroupPoints(groupName);
    }
    async calculateBracketPoints(req, matchId) {
        await this.authenticateAdmin(req);
        return this.adminService.calculateBracketPoints(matchId);
    }
    async calculateTournamentPoints(req) {
        await this.authenticateAdmin(req);
        return this.adminService.calculateTournamentPoints();
    }
    async recalculateUserPoints(req, userId) {
        await this.authenticateAdmin(req);
        return this.adminService.recalculateUserPoints(userId);
    }
    async getStats(req) {
        await this.authenticateAdmin(req);
        return this.adminService.getStats();
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)('users'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getAllUsers", null);
__decorate([
    (0, common_1.Patch)('users/:userId/role'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('userId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateUserRole", null);
__decorate([
    (0, common_1.Delete)('users/:userId'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "deleteUser", null);
__decorate([
    (0, common_1.Get)('scoring-config'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getScoringConfig", null);
__decorate([
    (0, common_1.Patch)('scoring-config'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateScoringConfig", null);
__decorate([
    (0, common_1.Post)('scoring/calculate-match/:matchId'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('matchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "calculateMatchPoints", null);
__decorate([
    (0, common_1.Post)('scoring/calculate-group/:groupName'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('groupName')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "calculateGroupPoints", null);
__decorate([
    (0, common_1.Post)('scoring/calculate-bracket/:matchId'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('matchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "calculateBracketPoints", null);
__decorate([
    (0, common_1.Post)('scoring/calculate-tournament'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "calculateTournamentPoints", null);
__decorate([
    (0, common_1.Post)('scoring/recalculate-user/:userId'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "recalculateUserPoints", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getStats", null);
exports.AdminController = AdminController = __decorate([
    (0, common_1.Controller)('admin'),
    __metadata("design:paramtypes", [admin_service_1.AdminService,
        auth_service_1.AuthService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map