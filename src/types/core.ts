import Cognito from '@/services/cognito';
import { CognitoIdTokenPayload } from 'aws-jwt-verify/jwt-model';

type UserAuth = CognitoIdTokenPayload & {
  email?: string
}

declare global {
  namespace NodeJS {
    export interface ProcessEnv {
      APP_PORT: string;
      APP_ENV: string;

      DATABASE_URL: string;
      BASE_IMAGE_URL: string;
      
      AWS_ACCESS_KEY_ID: string;
      AWS_SECRET_ACCESS_KEY: string;
      AWS_REGION: string;
      AWS_COGNITO_CLIENT_ID: string;
      AWS_COGNITO_POOL_ID: string;
    }
  }

  namespace Express {
    export interface Locals {
      auth?: UserAuth;
    }
  }
}

declare module 'vitest' {
  export interface TestContext {
    databaseUrl?: string;
    databaseName?: string;
  }
}
