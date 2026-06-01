import { PrismaService } from '../prisma/prisma.service';
export declare class AuthService {
    private prisma;
    constructor(prisma: PrismaService);
    findOrCreateGoogleUser(profile: {
        googleId: string;
        email: string;
        firstName: string;
        lastName: string;
        picture?: string;
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
    generateJwt(userId: string): string;
    verifyToken(token: string): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        googleId: string;
        email: string;
        avatarUrl: string | null;
        role: import(".prisma/client").$Enums.UserRole;
        lastLoginAt: Date | null;
    } | null>;
}
