import { PrismaService } from '../prisma/prisma.service';
import { ScoringService } from '../scoring/scoring.service';
import { UserRole } from '@prisma/client';
export declare class AdminService {
    private prisma;
    private scoringService;
    constructor(prisma: PrismaService, scoringService: ScoringService);
    getAllUsers(): Promise<{
        id: string;
        createdAt: Date;
        _count: {
            bracketPredictions: number;
            matchPredictions: number;
            groupPredictions: number;
            tournamentPredictions: number;
        };
        name: string;
        email: string;
        avatarUrl: string | null;
        role: import(".prisma/client").$Enums.UserRole;
        lastLoginAt: Date | null;
    }[]>;
    updateUserRole(userId: string, role: UserRole): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        googleId: string;
        email: string;
        avatarUrl: string | null;
        role: import(".prisma/client").$Enums.UserRole;
        lastLoginAt: Date | null;
    }>;
    deleteUser(userId: string): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        googleId: string;
        email: string;
        avatarUrl: string | null;
        role: import(".prisma/client").$Enums.UserRole;
        lastLoginAt: Date | null;
    }>;
    getScoringConfig(): Promise<{
        id: string;
        updatedAt: Date;
        correctWinner: number;
        correctGoalDifference: number;
        exactScore: number;
        groupAdvancingTeam: number;
        groupCorrectPosition: number;
        roundOf32: number;
        roundOf16: number;
        quarterFinal: number;
        semiFinal: number;
        final: number;
        tournamentWinner: number;
        goldenBoot: number;
    } | null>;
    updateScoringConfig(data: any): Promise<{
        id: string;
        updatedAt: Date;
        correctWinner: number;
        correctGoalDifference: number;
        exactScore: number;
        groupAdvancingTeam: number;
        groupCorrectPosition: number;
        roundOf32: number;
        roundOf16: number;
        quarterFinal: number;
        semiFinal: number;
        final: number;
        tournamentWinner: number;
        goldenBoot: number;
    }>;
    calculateMatchPoints(matchId: string): Promise<{
        success: boolean;
        updatedPredictions: number;
    }>;
    calculateGroupPoints(groupName: string): Promise<{
        success: boolean;
        updatedPredictions: number;
    }>;
    calculateBracketPoints(matchId: string): Promise<{
        success: boolean;
        updatedPredictions: number;
    }>;
    calculateTournamentPoints(): Promise<{
        success: boolean;
        updatedPredictions: number;
    }>;
    recalculateUserPoints(userId: string): Promise<{
        success: boolean;
    }>;
    getStats(): Promise<{
        totalUsers: number;
        totalMatches: number;
        totalPredictions: number;
        finishedMatches: number;
        upcomingMatches: number;
    }>;
}
