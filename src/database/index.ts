import { Sequelize } from 'sequelize';
import fs from 'fs';
import sequelizeConfig from './config/config';
import path from 'path';

const sequelize = new Sequelize(
  sequelizeConfig[process.env.NODE_ENV as string]
);

const files: string[] = fs.readdirSync(path.join(__dirname, 'models'));

const modelFiles = files.filter(
  (file) => file.indexOf('.') !== 0 && file.indexOf('.test.js') === -1
);

//for pass sequelize instance before call sequelize.sync at server.ts
//if remove this, models would be loaded lazily
modelFiles.forEach((file) => {
  import(path.join(__dirname, 'models', file));
});

export default sequelize;
