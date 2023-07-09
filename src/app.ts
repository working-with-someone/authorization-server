import express from 'express';
import errorHandler from './middleware/errorHandler';
import NotFound from './middleware/notFound';
import RequestLogger from './middleware/requestLogger';
import favicon from 'serve-favicon';

const app = express();

app.set('view engine', 'ejs');
app.set('views', `${process.cwd()}/views`);
app.use(favicon(`${process.cwd()}/favicon.ico`));

//serve statics
app.use(express.static(`${process.cwd()}/public`));

app.use(RequestLogger);
//import routers
import { authRouter } from './router';

//use router
app.use('/auth', authRouter);

//response 404 for any request to unknown endpoint
app.use('*', NotFound);

//error handler
app.use(errorHandler);

export default app;
