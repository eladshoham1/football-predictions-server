import { AuthService } from './auth.service';
import { Response } from 'express';
export declare class AuthController {
    private svc;
    constructor(svc: AuthService);
    googleAuth(req: any): Promise<void>;
    googleAuthCallback(req: any, res: Response): Promise<void>;
    me(req: any): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        googleId: string;
        email: string;
        avatarUrl: string | null;
        role: import(".prisma/client").$Enums.UserRole;
        lastLoginAt: Date | null;
    }>;
}
