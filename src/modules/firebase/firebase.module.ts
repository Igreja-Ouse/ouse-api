import { DynamicModule, Global, Module } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { FireBaseConfigService } from './firebase-config.service';
import { ConfigService } from '@nestjs/config';
import { FirebaseService } from './firebase.service';

@Global()
@Module({})
export class FirebaseModule {
  static forRoot(): DynamicModule {
    const firebaseConfigProvider = {
      provide: FireBaseConfigService,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const apiKey = configService.get<string>('FIREBASE_API_KEY');
        if (!apiKey) {
          throw new Error(
            'FIREBASE_API_KEY is not defined in the environment variables',
          );
        }

        return new FireBaseConfigService(apiKey);
      },
    };

    const firebaseProvider = {
      provide: 'FIREBASE_ADMIN',
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const credentials = configService.get<string>(
          'FIREBASE_ADMIN_CREDENTIALS',
        );
        if (!credentials) {
          throw new Error(
            'FIREBASE_ADMIN_CREDENTIALS is not defined in the environment variables',
          );
        }

        const serviceAccount = JSON.parse(credentials);
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });

        return admin;
      },
    };

    return {
      module: FirebaseModule,
      providers: [firebaseConfigProvider, firebaseProvider, FirebaseService],
      exports: [firebaseConfigProvider, firebaseProvider, FirebaseService],
    };
  }
}
