"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_module_1 = require("./prisma/prisma.module");
const matches_module_1 = require("./matches/matches.module");
const leaderboard_module_1 = require("./leaderboard/leaderboard.module");
const auth_module_1 = require("./auth/auth.module");
const predictions_module_1 = require("./predictions/predictions.module");
const worldcup_module_1 = require("./worldcup/worldcup.module");
const scoring_module_1 = require("./scoring/scoring.module");
const admin_module_1 = require("./admin/admin.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            worldcup_module_1.WorldcupModule,
            scoring_module_1.ScoringModule,
            admin_module_1.AdminModule,
            matches_module_1.MatchesModule,
            leaderboard_module_1.LeaderboardModule,
            predictions_module_1.PredictionsModule
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map