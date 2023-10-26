import * as winston from 'winston';

export default class Logger {

  static #client?: winston.Logger;

  static setup() {
    this.#client = winston.createLogger({
      level: 'debug',
      exitOnError: false,
      format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
      transports: [
        new winston.transports.File({ filename: 'src/storage/logs/debug.log' }),
      ],
    });
    if (process.env.APP_ENV !== 'prod') {
      this.#client.add(new winston.transports.Console({
        format: winston.format.simple(),
        level: 'verbose'
      }));
    }
  }

  static log(level: string, message: string) {
    this.#client?.log({
      level: level,
      message: message
    });
  }

  static info(message: string): void {
    this.log('info', message);
  }

  static debug(message: string): void {
    this.log('debug', message);
  }

  static error(message: string): void {
    this.log('error', message);
  }
}
