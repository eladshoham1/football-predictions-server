import { PrismaService } from '../prisma/prisma.service';
export declare class TeamsController {
    private prisma;
    constructor(prisma: PrismaService);
    list(): Promise<{
        id: string;
        name: string;
        code: string;
        flagUrl: string | null;
        groupName: string | null;
    }[]>;
    listPlayers(): Promise<({
        team: {
            id: string;
            name: string;
            code: string;
            flagUrl: string | null;
        };
    } & {
        id: string;
        externalApiId: string | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        teamId: string;
        position: string | null;
    })[]>;
}
