import { PrismaService } from '../prisma/prisma.service';
export declare class PredictionsService {
    private prisma;
    constructor(prisma: PrismaService);
    upsertForUser(userId: string, payload: {
        matchId: string;
        homeScore: number;
        awayScore: number;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        matchId: string;
        predictedHomeScore: number;
        predictedAwayScore: number;
        pointsAwarded: number;
    }>;
    forUserId(userId: string): Promise<({
        match: {
            homeTeam: {
                id: string;
                externalApiId: string | null;
                groupName: string | null;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                code: string;
                flagUrl: string | null;
            };
            awayTeam: {
                id: string;
                externalApiId: string | null;
                groupName: string | null;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                code: string;
                flagUrl: string | null;
            };
        } & {
            id: string;
            externalApiId: string | null;
            stage: import(".prisma/client").$Enums.MatchStage;
            round: number | null;
            groupName: string | null;
            homeTeamId: string;
            awayTeamId: string;
            kickoffTime: Date;
            homeScore: number | null;
            awayScore: number | null;
            penaltyWinnerId: string | null;
            status: import(".prisma/client").$Enums.MatchStatus;
            venue: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        matchId: string;
        predictedHomeScore: number;
        predictedAwayScore: number;
        pointsAwarded: number;
    })[]>;
    upsertGroupPrediction(userId: string, payload: {
        groupName: string;
        firstPlaceTeamId: string;
        secondPlaceTeamId: string;
        thirdPlaceTeamId?: string;
        fourthPlaceTeamId?: string;
    }): Promise<{
        id: string;
        groupName: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        pointsAwarded: number;
        firstPlaceTeamId: string;
        secondPlaceTeamId: string;
        thirdPlaceTeamId: string | null;
        fourthPlaceTeamId: string | null;
    }>;
    getUserGroupPredictions(userId: string): Promise<({
        firstPlaceTeam: {
            id: string;
            externalApiId: string | null;
            groupName: string | null;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            code: string;
            flagUrl: string | null;
        };
        secondPlaceTeam: {
            id: string;
            externalApiId: string | null;
            groupName: string | null;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            code: string;
            flagUrl: string | null;
        };
        thirdPlaceTeam: {
            id: string;
            externalApiId: string | null;
            groupName: string | null;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            code: string;
            flagUrl: string | null;
        } | null;
        fourthPlaceTeam: {
            id: string;
            externalApiId: string | null;
            groupName: string | null;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            code: string;
            flagUrl: string | null;
        } | null;
    } & {
        id: string;
        groupName: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        pointsAwarded: number;
        firstPlaceTeamId: string;
        secondPlaceTeamId: string;
        thirdPlaceTeamId: string | null;
        fourthPlaceTeamId: string | null;
    })[]>;
    upsertGroupPredictions(userId: string, predictions: Array<{
        groupName: string;
        firstPlaceTeamId: string;
        secondPlaceTeamId: string;
        thirdPlaceTeamId?: string;
        fourthPlaceTeamId?: string;
    }>): Promise<{
        id: string;
        groupName: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        pointsAwarded: number;
        firstPlaceTeamId: string;
        secondPlaceTeamId: string;
        thirdPlaceTeamId: string | null;
        fourthPlaceTeamId: string | null;
    }[]>;
    upsertBracketPrediction(userId: string, payload: {
        matchId: string;
        predictedWinnerTeamId: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        matchId: string;
        pointsAwarded: number;
        predictedTeamId: string;
    }>;
    getUserBracketPredictions(userId: string): Promise<({
        predictedTeam: {
            id: string;
            externalApiId: string | null;
            groupName: string | null;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            code: string;
            flagUrl: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        matchId: string;
        pointsAwarded: number;
        predictedTeamId: string;
    })[]>;
    upsertBracketPredictions(userId: string, payload: {
        bracketPredictions: Array<{
            matchId: string;
            predictedWinnerTeamId: string;
        }>;
        tournamentWinnerId: string;
        thirdPlaceWinnerId: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    upsertTournamentPrediction(userId: string, payload: {
        winnerTeamId: string;
        goldenBootPlayerId?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        winnerTeamId: string;
        goldenBootPlayerId: string | null;
        winnerPointsAwarded: number;
        goldenBootPointsAwarded: number;
    }>;
    getUserTournamentPrediction(userId: string): Promise<({
        winnerTeam: {
            id: string;
            externalApiId: string | null;
            groupName: string | null;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            code: string;
            flagUrl: string | null;
        };
        goldenBootPlayer: {
            id: string;
            externalApiId: string | null;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            teamId: string;
            position: string | null;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        winnerTeamId: string;
        goldenBootPlayerId: string | null;
        winnerPointsAwarded: number;
        goldenBootPointsAwarded: number;
    }) | null>;
    getGroupLockStatus(groupName: string): Promise<{
        isLocked: boolean;
        lockTime: Date | null;
        firstMatchTime: Date | null;
    }>;
}
