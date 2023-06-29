import { Sequelize } from 'sequelize';
import sequelizeConfig from './config/config';

const sequelize = new Sequelize(
  sequelizeConfig[process.env.NODE_ENV as string]
);

export default sequelize;
