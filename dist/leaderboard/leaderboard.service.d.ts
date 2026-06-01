import { PrismaService } from '../prisma/prisma.service';
export declare class LeaderboardService {
    private prisma;
    constructor(prisma: PrismaService);
    get(): Promise<{
        userId: string;
        name: string;
        avatarUrl: string | null;
        points: number;
        exactCount: number;
        scoringCount: number;
        rank?: number | undefined;
    }[]>;
}
