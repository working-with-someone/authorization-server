import express from 'express';
import errorHandler from './middleware/errorHandler';
import NotFound from './middleware/notFound';
import RequestLogger from './middleware/requestLogger';
import favicon from 'serve-favicon';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

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

app.set('view engine', 'ejs');
app.set('views', `${process.cwd()}/views`);
app.use(favicon(`${process.cwd()}/favicon.ico`));
app.use(cookieParser());

//urlencoded body parser
app.use(express.urlencoded({ extended: true }));

//serve statics
app.use(express.static(`${process.cwd()}/public`));

app.use(RequestLogger);

//import routers
import { authRouter } from './routes';

//use router
app.use('/auth', authRouter);

//response 404 for any request to unknown endpoint
app.use('*', NotFound);

//error handler
app.use(errorHandler);

export default app;
