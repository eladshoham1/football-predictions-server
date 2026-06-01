import { MatchesService } from './matches.service';
export declare class MatchesController {
    private readonly svc;
    constructor(svc: MatchesService);
    getMatches(): Promise<({
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
    })[]>;
    getWcMatches(): Promise<{
        id: string;
        kickoffTime: Date;
        stage: import(".prisma/client").$Enums.MatchStage;
        status: import(".prisma/client").$Enums.MatchStatus;
        homeTeam: {
            id: string;
            name: string;
            code: string;
            flagUrl: string | null;
        };
        awayTeam: {
            id: string;
            name: string;
            code: string;
            flagUrl: string | null;
        };
        homeScore: number | null;
        awayScore: number | null;
    }[]>;
}
