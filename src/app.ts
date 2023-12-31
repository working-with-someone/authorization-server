import express from 'express';
import errorHandler from './middleware/errorHandler';
import NotFound from './middleware/notFound';
import RequestLogger from './middleware/requestLogger';
import favicon from 'serve-favicon';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { authMiddleware } from './middleware/auth.';
import cors from 'cors';

const app = express();

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        formAction: ['self', 'wwsp-dev: *', 'wwsp: *'],
      },
    },
  })
);

app.use(
  cors({
    origin: process.env.CORS_ALLOWED_ORIGIN.split(' '),
  })
);

app.set('view engine', 'ejs');
app.set('views', `${process.cwd()}/views`);
app.use(favicon(`${process.cwd()}/favicon.ico`));
app.use(cookieParser());

//urlencoded body parser
app.use(express.urlencoded({ extended: true }));

//serve statics
app.use(express.static(`${process.cwd()}/public`));
app.use(express.static(`${process.cwd()}/uploads`));

app.use(RequestLogger);

//import routers
import { authRouter, clientRouter } from './routes';

//use middleware
app.use('/app', authMiddleware, clientRouter);

//use router
app.use('/auth', authRouter);

//response 404 for any request to unknown endpoint
app.use('*', NotFound);

//error handler
app.use(errorHandler);

export default app;
