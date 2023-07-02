import winston, { LoggerOptions } from 'winston';
import path from 'path';

const webServerLoggerConfig: LoggerOptions = {
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: path.join(process.cwd(), 'log/webserver.log'),
    }),
  ],
};

const sysErrorLoggerConfig: LoggerOptions = {
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: path.join(process.cwd(), 'log/sys-error.log'),
    }),
  ],
};

export { webServerLoggerConfig, sysErrorLoggerConfig };
