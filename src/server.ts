import 'dotenv/config';

import http from 'http';
import app from './app';
import sequelize from './database';
import { SyncOptions } from 'sequelize';

const server = http.createServer(app);

function serverListening() {
  console.log(`Server is listening on port ${process.env.PORT}`);
}

const syncOptions: SyncOptions = {
  alter: process.env.NODE_ENV === 'development' ? true : false,
};

sequelize
  .sync(syncOptions)
  .then(() => {
    server.listen(process.env.PORT, serverListening);
  })
  .catch((err) => {
    throw err;
  });
