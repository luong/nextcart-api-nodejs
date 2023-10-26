import {
  AdminCreateUserCommand,
  AdminInitiateAuthCommand,
  AdminRespondToAuthChallengeCommand,
  AuthFlowType,
  ChallengeNameType,
  CognitoIdentityProviderClient,
} from '@aws-sdk/client-cognito-identity-provider';
import { CognitoJwtVerifier } from 'aws-jwt-verify';
import { CognitoIdTokenPayload } from 'aws-jwt-verify/jwt-model';

type CognitoConfigParams = {
  region?: string,
  accessKey?: string,
  secretKey?: string,
  poolId?: string,
  clientId?: string
};

export default class Cognito {

  private static jwks: any;
  private configParams: CognitoConfigParams;

  constructor(configParams?: CognitoConfigParams) {
    if (configParams === undefined) {
      configParams = {
        region: process.env.AWS_REGION,
        accessKey: process.env.AWS_ACCESS_KEY_ID,
        secretKey: process.env.AWS_SECRET_ACCESS_KEY,
        poolId: process.env.AWS_COGNITO_POOL_ID,
        clientId: process.env.AWS_COGNITO_CLIENT_ID
      }
    }
    this.configParams = configParams!;
  }

  public async verifyIdToken(idToken: string): Promise<CognitoIdTokenPayload> {
    const verifier = CognitoJwtVerifier.create({
      userPoolId: this.configParams.poolId!,
      tokenUse: 'id',
      clientId: this.configParams.clientId!
    });
    if (!Cognito.jwks) {
      await this.cacheJwks();
    }
    verifier.cacheJwks(Cognito.jwks);
    return verifier.verify(idToken, {});
  }

  public async auth(email: string, password: string) {
    const command = new AdminInitiateAuthCommand({
      AuthFlow: AuthFlowType.ADMIN_USER_PASSWORD_AUTH,
      AuthParameters: { USERNAME: email, PASSWORD: password },
      ClientId: this.configParams.clientId,
      UserPoolId: this.configParams.poolId
    });
    return this.getClient().send(command);
  }

  /**
   * challengeParams format like { USERNAME: '',  NEW_PASSWORD: '' } when challengeName equals NEW_PASSWORD_REQUIRED
   */
  public async responseAuth(challengeName: ChallengeNameType, challengeParams: Record<string, string>, session: string) {
    const command = new AdminRespondToAuthChallengeCommand({
      ClientId: this.configParams.clientId,
      UserPoolId: this.configParams.poolId,
      ChallengeName: challengeName,
      ChallengeResponses: challengeParams,
      Session: session
    });
    return this.getClient().send(command);
  }

  public async createUser(email: string, password: string) {
    const command = new AdminCreateUserCommand({
      UserPoolId: this.configParams.poolId,
      Username: email,
      TemporaryPassword: password,
      DesiredDeliveryMediums: ['EMAIL']
    });
    return this.getClient().send(command);
  }

  public async cacheJwks() {
    const url = `https://cognito-idp.${this.configParams.region}.amazonaws.com/${this.configParams.poolId}/.well-known/jwks.json`;
    const response = await fetch(url);
    Cognito.jwks =  await response.json();
  }

  private getClient(): CognitoIdentityProviderClient {
    return new CognitoIdentityProviderClient({ 
      region: process.env.AWS_REGION!,
      credentials: {
        accessKeyId: this.configParams.accessKey!,
        secretAccessKey: this.configParams.secretKey!
      }
    });
  }

}