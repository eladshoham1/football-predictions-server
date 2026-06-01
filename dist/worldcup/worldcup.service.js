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
var WorldcupService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorldcupService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const axios_1 = require("axios");
const API_BASE_URL = 'https://worldcup26.ir/get';
let WorldcupService = WorldcupService_1 = class WorldcupService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(WorldcupService_1.name);
    }
    async syncMatches() {
        const startTime = Date.now();
        let syncedCount = 0;
        let errorCount = 0;
        try {
            this.logger.log('Starting World Cup data sync...');
            this.logger.log('Fetching teams data...');
            const teamsResponse = await axios_1.default.get(`${API_BASE_URL}/teams`, { timeout: 30000 });
            const teams = teamsResponse.data.teams;
            if (!Array.isArray(teams) || teams.length === 0) {
                throw new Error('No teams data received from API');
            }
            this.logger.log(`Syncing ${teams.length} teams...`);
            for (const team of teams) {
                try {
                    await this.upsertTeam(team);
                }
                catch (error) {
                    this.logger.error(`Failed to sync team ${team.name_en}: ${error === null || error === void 0 ? void 0 : error.message}`);
                }
            }
            this.logger.log('Fetching games data...');
            const gamesResponse = await axios_1.default.get(`${API_BASE_URL}/games`, { timeout: 30000 });
            const games = gamesResponse.data.games;
            if (!Array.isArray(games) || games.length === 0) {
                throw new Error('No games data received from API');
            }
            this.logger.log(`Syncing ${games.length} matches...`);
            for (const game of games) {
                try {
                    await this.upsertMatch(game);
                    syncedCount++;
                }
                catch (error) {
                    this.logger.error(`Failed to sync match ${game.id}: ${error === null || error === void 0 ? void 0 : error.message}`);
                    errorCount++;
                }
            }
            const duration = Date.now() - startTime;
            await this.logSync('SUCCESS', `Synced ${syncedCount} matches in ${duration}ms`, syncedCount, errorCount);
            this.logger.log(`Sync completed: ${syncedCount} synced, ${errorCount} errors`);
            return { synced: syncedCount, errors: errorCount };
        }
        catch (error) {
            const message = (error === null || error === void 0 ? void 0 : error.message) || String(error);
            this.logger.error(`Sync failed: ${message}`);
            await this.logSync('ERROR', message, syncedCount, errorCount);
            throw error;
        }
    }
    async upsertTeam(teamData) {
        await this.prisma.team.upsert({
            where: { externalApiId: teamData.id },
            update: {
                name: teamData.name_en,
                code: teamData.fifa_code,
                groupName: teamData.groups || null,
                flagUrl: teamData.flag,
            },
            create: {
                externalApiId: teamData.id,
                name: teamData.name_en,
                code: teamData.fifa_code,
                groupName: teamData.groups || null,
                flagUrl: teamData.flag,
            },
        });
    }
    async upsertMatch(gameData) {
        const homeTeam = await this.prisma.team.findUnique({
            where: { externalApiId: gameData.home_team_id },
        });
        const awayTeam = await this.prisma.team.findUnique({
            where: { externalApiId: gameData.away_team_id },
        });
        if (!homeTeam || !awayTeam) {
            throw new Error(`Teams not found for match ${gameData.id}: home=${gameData.home_team_id}, away=${gameData.away_team_id}`);
        }
        const kickoffTime = this.parseDate(gameData.local_date);
        const status = this.mapStatus(gameData.finished, gameData.time_elapsed);
        const stage = this.determineStage(gameData.type, gameData.group);
        const homeScore = gameData.home_score !== '0' || gameData.finished === 'TRUE'
            ? parseInt(gameData.home_score)
            : null;
        const awayScore = gameData.away_score !== '0' || gameData.finished === 'TRUE'
            ? parseInt(gameData.away_score)
            : null;
        await this.prisma.match.upsert({
            where: { externalApiId: gameData.id },
            update: {
                homeScore,
                awayScore,
                status,
            },
            create: {
                externalApiId: gameData.id,
                stage,
                groupName: gameData.group || null,
                homeTeamId: homeTeam.id,
                awayTeamId: awayTeam.id,
                kickoffTime,
                homeScore,
                awayScore,
                status,
            },
        });
    }
    parseDate(dateStr) {
        const [datePart, timePart] = dateStr.split(' ');
        const [month, day, year] = datePart.split('/').map(Number);
        const [hours, minutes] = timePart.split(':').map(Number);
        return new Date(Date.UTC(year, month - 1, day, hours, minutes));
    }
    determineStage(type, group) {
        if (type === 'group' || group) {
            return 'GROUP_STAGE';
        }
        return 'GROUP_STAGE';
    }
    mapStatus(finished, timeElapsed) {
        if (finished === 'TRUE' || timeElapsed === 'FT') {
            return 'FINISHED';
        }
        if (timeElapsed === 'notstarted') {
            return 'SCHEDULED';
        }
        if (timeElapsed === 'HT' || (timeElapsed !== 'notstarted' && timeElapsed !== 'FT')) {
            return 'LIVE';
        }
        return 'SCHEDULED';
    }
    async logSync(status, message, syncedCount, errorCount) {
        try {
            await this.prisma.syncLog.create({
                data: {
                    status,
                    message,
                    syncedCount,
                    errorCount,
                },
            });
        }
        catch (error) {
            this.logger.error(`Failed to log sync: ${(error === null || error === void 0 ? void 0 : error.message) || String(error)}`);
        }
    }
    async getSyncLogs(limit = 20) {
        return await this.prisma.syncLog.findMany({
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
    }
};
exports.WorldcupService = WorldcupService;
exports.WorldcupService = WorldcupService = WorldcupService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WorldcupService);
//# sourceMappingURL=worldcup.service.js.map