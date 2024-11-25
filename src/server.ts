import http from 'http';
import app from './app';
import redisClient from './database/clients/redis';
import s3Client from './database/clients/s3';

const server = http.createServer(app);

function serverListening() {
  console.log(`Server is listening on port ${process.env.PORT} 🔥`);
  redisClient.connect();
}

server.on('close', () => {
  redisClient.disconnect();
  s3Client.destroy();
});

server.listen(process.env.PORT, serverListening);

export default server;
