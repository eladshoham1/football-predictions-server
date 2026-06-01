import { PredictionsService } from './predictions.service';
import { AuthService } from '../auth/auth.service';
export declare class PredictionsController {
    private svc;
    private authService;
    constructor(svc: PredictionsService, authService: AuthService);
    upsertMatch(req: any, body: {
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
    myMatches(req: any): Promise<({
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
    upsertGroup(req: any, body: {
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
    myGroups(req: any): Promise<({
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
    upsertBracket(req: any, body: {
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
    myBrackets(req: any): Promise<({
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
    upsertBrackets(req: any, body: {
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
    upsertTournament(req: any, body: {
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
    myTournament(req: any): Promise<({
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
    upsertGroups(req: any, body: {
        predictions: Array<{
            groupName: string;
            firstPlaceTeamId: string;
            secondPlaceTeamId: string;
            thirdPlaceTeamId?: string;
            fourthPlaceTeamId?: string;
        }>;
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
    }[]>;
    getGroupsLockStatus(): Promise<{
        isLocked: boolean;
        lockTime: Date | null;
        firstMatchTime: Date | null;
        groupName: string;
    }[]>;
}
