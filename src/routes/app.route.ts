import { Router } from 'express';
import { getApp, getApps } from '../controller/client.controller';

const router = Router();

router.get('/', getApps);
router.get('/:appId', getApp);

export default router;
