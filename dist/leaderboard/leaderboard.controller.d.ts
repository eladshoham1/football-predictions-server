import { LeaderboardService } from './leaderboard.service';
export declare class LeaderboardController {
    private readonly svc;
    constructor(svc: LeaderboardService);
    getLeaderboard(): Promise<{
        userId: string;
        name: string;
        avatarUrl: string | null;
        points: number;
        exactCount: number;
        scoringCount: number;
        rank?: number | undefined;
    }[]>;
}
