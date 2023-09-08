import { Router } from 'express';
import { renderHome } from '../controller/home.controller';

const router = Router();

router.get('/', renderHome);

export default router;
