import winston from 'winston';
import { webServerLoggerConfig, sysErrorLoggerConfig } from './config/config';

const webServerLogger = winston.createLogger(webServerLoggerConfig);

const sysErrorLogger = winston.createLogger(sysErrorLoggerConfig);

export { webServerLogger, sysErrorLogger };
