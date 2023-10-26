import app from '@/app';
import Logger from '@/config/logger';
import Cognito from '@/services/cognito';

const PORT: number = parseInt(process.env.APP_PORT!);
const HOST: string = '0.0.0.0';

new Cognito().cacheJwks();

app.listen(PORT, HOST, () => {
  Logger.info(`NextCart API running on https://${HOST}:${PORT}`);
});