import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
export declare class FirebaseService implements OnModuleInit {
    private configService;
    private firebaseApp;
    private readonly logger;
    constructor(configService: ConfigService);
    onModuleInit(): void;
    verifyIdToken(idToken: string): Promise<admin.auth.DecodedIdToken>;
    getUserByUid(uid: string): Promise<admin.auth.UserRecord>;
}
