import { AdminService } from './admin.service';
import { AuthService } from '../auth/auth.service';
export declare class AdminController {
    private adminService;
    private authService;
    constructor(adminService: AdminService, authService: AuthService);
    private authenticateAdmin;
    getAllUsers(req: any): Promise<{
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
    updateUserRole(req: any, userId: string, body: {
        role: 'USER' | 'ADMIN';
    }): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        googleId: string;
        email: string;
        avatarUrl: string | null;
        role: import(".prisma/client").$Enums.UserRole;
        lastLoginAt: Date | null;
    }>;
    deleteUser(req: any, userId: string): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        googleId: string;
        email: string;
        avatarUrl: string | null;
        role: import(".prisma/client").$Enums.UserRole;
        lastLoginAt: Date | null;
    }>;
    getScoringConfig(req: any): Promise<{
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
    updateScoringConfig(req: any, body: any): Promise<{
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
    calculateMatchPoints(req: any, matchId: string): Promise<{
        success: boolean;
        updatedPredictions: number;
    }>;
    calculateGroupPoints(req: any, groupName: string): Promise<{
        success: boolean;
        updatedPredictions: number;
    }>;
    calculateBracketPoints(req: any, matchId: string): Promise<{
        success: boolean;
        updatedPredictions: number;
    }>;
    calculateTournamentPoints(req: any): Promise<{
        success: boolean;
        updatedPredictions: number;
    }>;
    recalculateUserPoints(req: any, userId: string): Promise<{
        success: boolean;
    }>;
    getStats(req: any): Promise<{
        totalUsers: number;
        totalMatches: number;
        totalPredictions: number;
        finishedMatches: number;
        upcomingMatches: number;
    }>;
}
