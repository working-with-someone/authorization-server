import express from 'express';
const app = express();

app.set('view engine', 'ejs');
app.set('views', `${process.cwd()}/wws-client/public`);

//import routers
import { authRouter } from './router';

//use router
app.use('/auth', authRouter);

export default app;
