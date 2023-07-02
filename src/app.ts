import express from 'express';
import errorHandler from './middleware/errorHandler';
import NotFound from './middleware/notFound';
import RequestLogger from './middleware/requestLogger';

const app = express();

app.set('view engine', 'ejs');
app.set('views', `${process.cwd()}/wws-client/public`);

//serve statics
app.use(express.static(`${process.cwd()}/wws-client/public/statics`));

app.use(RequestLogger);
//import routers
import { authRouter, homeRouter } from './router';

//use router
app.use('/auth', authRouter);
app.get('/', homeRouter);

//response 404 for any request to unknown endpoint
app.use('*', NotFound);

//error handler
app.use(errorHandler);

export default app;
