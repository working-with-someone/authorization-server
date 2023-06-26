import express from 'express';
import errorHandler from './middleware/errorHandler';
import HttpStatusCode from 'http-status-codes';

const app = express();

app.set('view engine', 'ejs');
app.set('views', `${process.cwd()}/wws-client/public`);

//serve statics
app.use(express.static(`${process.cwd()}/wws-client/public/statics`));

//import routers
import { authRouter, homeRouter } from './router';
import { wwsError } from './utils/wwsError';

//use router
app.use('/auth', authRouter);
app.get('/', homeRouter);

//response 404 for any request to unknown endpoint
app.use('*', (req, res, next) => {
  next(new wwsError(HttpStatusCode.NOT_FOUND, 'Can not found page'));
});

//error handler
app.use(errorHandler);

export default app;
