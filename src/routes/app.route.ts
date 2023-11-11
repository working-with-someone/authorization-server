import { Router } from 'express';
import { getApps } from '../controller/client.controller';

const router = Router();

router.get('/', getApps);

export default router;
