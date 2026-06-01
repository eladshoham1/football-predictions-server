import { PrismaService } from '../prisma/prisma.service';
export declare class ScoringService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    calculateMatchPoints(matchId: string): Promise<number>;
    private computeMatchPoints;
    calculateGroupPoints(groupName: string): Promise<number>;
    calculateBracketPoints(matchId: string): Promise<number>;
    calculateTournamentPoints(): Promise<number>;
    recalculateUserPoints(userId: string): Promise<void>;
}
