import { WorldcupService } from './worldcup.service';
import { AuthService } from '../auth/auth.service';
export declare class WorldcupController {
    private worldcupService;
    private authService;
    constructor(worldcupService: WorldcupService, authService: AuthService);
    syncMatches(req: any): Promise<{
        synced: number;
        errors: number;
    }>;
    syncMatchesDev(): Promise<{
        synced: number;
        errors: number;
    }>;
    getSyncLogs(req: any): Promise<{
        id: string;
        status: string;
        createdAt: Date;
        message: string | null;
        syncedCount: number;
        errorCount: number;
    }[]>;
    private getUserFromRequest;
}
