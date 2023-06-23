import { Router } from 'express';
import { renderHome } from '../controller/home';

const homeRouter = Router();

homeRouter.use('/', renderHome);

export default homeRouter;
