import { PrismaService } from '../prisma/prisma.service';
export declare class WorldcupService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    syncMatches(): Promise<{
        synced: number;
        errors: number;
    }>;
    private upsertTeam;
    private upsertMatch;
    private parseDate;
    private determineStage;
    private mapStatus;
    private logSync;
    getSyncLogs(limit?: number): Promise<{
        id: string;
        status: string;
        createdAt: Date;
        message: string | null;
        syncedCount: number;
        errorCount: number;
    }[]>;
}
