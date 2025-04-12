import { BadRequestException, Injectable } from "@nestjs/common";
import * as firebaseAdmin from 'firebase-admin';
import { CreateRequest, UpdateRequest } from "firebase-admin/lib/auth/auth-config";
import { UserRecord } from "firebase-admin/lib/auth/user-record";
import { FireBaseConfigService } from "./firebase-config.service";
import axios from "axios";
import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";
import { ref } from "process";

@Injectable()
export class FirebaseService{

    private readonly apiKey: string;

    constructor(firebaseConfig: FireBaseConfigService) {
        this.apiKey = firebaseConfig.apiKey;
    }

    async getUserByUid(uid: string): Promise<UserRecord> {
        return await firebaseAdmin.auth().getUser(uid).catch(this.handleFirebaseAuthError) as UserRecord;
    }

    async createUser(proprs: CreateRequest): Promise<UserRecord> {
        return await firebaseAdmin.auth().createUser(proprs).catch(this.handleFirebaseAuthError) as UserRecord;
    }

    async setCustomUserClaims(uid: string, claims: Record<string, any>) {
        return await firebaseAdmin.auth().setCustomUserClaims(uid, claims);
    }

    async verifyIdToken(idToken: string): Promise<DecodedIdToken> {
        return await firebaseAdmin.auth().verifyIdToken(idToken).catch(this.handleFirebaseAuthError) as DecodedIdToken;
    }

    async signInWithEmailAndPassword(email: string, password: string) {
        const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${this.apiKey}`;
        return await this.sendPostRequest(url, { email, password, returnSecureToken: true }).catch(this.handleRestApiError);
    }

    async updateUser(uid: string, userData: UpdateRequest): Promise<UserRecord> {
        try {
            return await firebaseAdmin.auth().updateUser(uid, userData).catch(this.handleFirebaseAuthError) as UserRecord;
        } catch (error) {
            this.handleFirebaseAuthError(error);
            throw error; 
        }
    }

    async refreshAuthToken(refreshToken: string) {
        const {
            id_token: idToken,
            refresh_token: newRefreshToken,
            expires_in: expiresIn,
        } = await this.sendRefreshAuthToken(refreshToken).catch(this.handleRestApiError);
        return { idToken, newRefreshToken, expiresIn };
    }

    async revokeRefreshTokens(uid: string) {
        return await firebaseAdmin.auth().revokeRefreshTokens(uid).catch(this.handleFirebaseAuthError);
    }

    async sendRefreshAuthToken(refreshToken: string) {
        const url = `https://securetoken.googleapis.com/v1/token?key=${this.apiKey}`;
        return await this.sendPostRequest(url, { grant_type: 'refresh_token', refresh_token: refreshToken });
    }

    async sendPasswordResetEmail(email: string): Promise<void> {
        try {
          const url = `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${this.apiKey}`;
          await this.sendPostRequest(url, {
            requestType: 'PASSWORD_RESET',
            email: email
          });
        } catch (error) {
          this.handleRestApiError(error);
          throw error;
        }
      }

    private async sendPostRequest(url: string, data: any) {
        const response = await axios.post(url, data, { headers: { 'Content-Type': 'application/json' } });
        return response.data;
    }

    private handleFirebaseAuthError(error: any){
        if(error.code?.startsWith('auth/'))
            throw new BadRequestException(error.message);

        throw new Error(error.message);
    }

    private handleRestApiError(error: any){
        if(error.response?.data?.error?.code === 400){
            const messageKey = error.response?.data?.error?.message;
            const message = {
                INVALID_LOGIN_CREDENTIALS: 'Invalid login credentials',
                INVALID_REFRESH_TOKEN: 'Invalid refresh token',
                TOKEN_EXPIRED: 'Token expired',
                USER_DISABLED: 'User disabled',
            }[messageKey] || messageKey;

            throw new BadRequestException(message);

        }
            
        throw new Error(error.message);

    }
}