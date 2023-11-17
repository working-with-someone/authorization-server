import { Router } from 'express';
import { getClient, getClients } from '../controller/client.controller';

const router = Router();

router.get('/', getClients);
router.get('/:clientId', getClient);

export default router;
