import { Options } from 'sequelize';
import 'dotenv/config';
import { databaseLogger } from '../../logger/winston';

interface Configs {
  [key: string]: Options;
}

const configs: Configs = {
  development: {
    username: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    host: process.env.DATABASE_HOST,
    dialect: 'mysql',
    logging: (msg) => databaseLogger.info(msg),
  },
  test: {
    username: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    host: process.env.DATABASE_HOST,
    dialect: 'mysql',
    logging: (msg) => databaseLogger.info(msg),
  },
  production: {
    username: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    host: process.env.DATABASE_HOST,
    dialect: 'mysql',
    logging: (msg) => databaseLogger.info(msg),
  },
};

export = configs;
