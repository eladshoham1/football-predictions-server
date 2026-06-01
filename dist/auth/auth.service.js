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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || 'dev';
let AuthService = class AuthService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findOrCreateGoogleUser(profile) {
        let user = await this.prisma.user.findUnique({ where: { googleId: profile.googleId } });
        if (!user) {
            user = await this.prisma.user.findUnique({ where: { email: profile.email } });
        }
        if (!user) {
            const name = `${profile.firstName} ${profile.lastName}`.trim() || profile.email;
            user = await this.prisma.user.create({
                data: {
                    googleId: profile.googleId,
                    email: profile.email,
                    name,
                    avatarUrl: profile.picture,
                    lastLoginAt: new Date(),
                },
            });
        }
        else {
            user = await this.prisma.user.update({
                where: { id: user.id },
                data: {
                    lastLoginAt: new Date(),
                    avatarUrl: profile.picture || user.avatarUrl,
                },
            });
        }
        return user;
    }
    generateJwt(userId) {
        return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: '30d' });
    }
    async verifyToken(token) {
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            if (!(decoded === null || decoded === void 0 ? void 0 : decoded.sub))
                return null;
            return await this.prisma.user.findUnique({ where: { id: decoded.sub } });
        }
        catch (e) {
            return null;
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AuthService);
//# sourceMappingURL=auth.service.js.map