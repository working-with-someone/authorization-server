import express from 'express';
const app = express();

app.set('view engine', 'ejs');
app.set('views', `${process.cwd()}/wws-client/public`);

//import routers
import { authRouter, homeRouter } from './router';

//use router
app.use('/auth', authRouter);
app.use('/', homeRouter);

export default app;
