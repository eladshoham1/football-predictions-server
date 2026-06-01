"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var FirebaseService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FirebaseService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const admin = require("firebase-admin");
let FirebaseService = FirebaseService_1 = class FirebaseService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(FirebaseService_1.name);
    }
    onModuleInit() {
        try {
            const projectId = this.configService.get('FIREBASE_PROJECT_ID');
            const serviceAccountKey = this.configService.get('FIREBASE_SERVICE_ACCOUNT_KEY');
            this.logger.log(`Initializing Firebase Admin SDK for project: ${projectId}`);
            if (serviceAccountKey) {
                try {
                    const serviceAccount = JSON.parse(serviceAccountKey);
                    this.firebaseApp = admin.initializeApp({
                        credential: admin.credential.cert(serviceAccount),
                        projectId: projectId,
                    });
                    this.logger.log('Firebase initialized with service account');
                }
                catch (parseError) {
                    this.logger.error('Failed to parse service account key:', parseError);
                    throw new Error('Invalid Firebase service account key format');
                }
            }
            else {
                throw new Error('Firebase service account key is required');
            }
            this.logger.log(`Firebase Admin SDK initialized successfully`);
        }
        catch (error) {
            this.logger.error('Firebase initialization failed:', error);
            throw error;
        }
    }
    async verifyIdToken(idToken) {
        var _a;
        try {
            if (!this.firebaseApp) {
                throw new Error('Firebase app not initialized');
            }
            const decodedToken = await admin.auth(this.firebaseApp).verifyIdToken(idToken);
            return decodedToken;
        }
        catch (error) {
            const msg = (_a = error === null || error === void 0 ? void 0 : error.message) !== null && _a !== void 0 ? _a : String(error);
            this.logger.error('Firebase token verification failed:', msg);
            throw new Error(`Firebase token verification failed: ${msg}`);
        }
    }
    async getUserByUid(uid) {
        var _a;
        try {
            const userRecord = await admin.auth(this.firebaseApp).getUser(uid);
            return userRecord;
        }
        catch (error) {
            const msg = (_a = error === null || error === void 0 ? void 0 : error.message) !== null && _a !== void 0 ? _a : String(error);
            this.logger.error(`Failed to get user ${uid}:`, msg);
            throw new Error(`Failed to get user: ${msg}`);
        }
    }
};
exports.FirebaseService = FirebaseService;
exports.FirebaseService = FirebaseService = FirebaseService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], FirebaseService);
//# sourceMappingURL=firebase.service.js.map