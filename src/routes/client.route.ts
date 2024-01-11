import { Router } from 'express';
import {
  createClient,
  getClient,
  getClients,
} from '../controller/client.controller';

import minion from '../middleware/minions';

const router = Router();

router.get('/', getClients);
router.get('/:clientId', getClient);
router.post('/', minion({ limits: { files: 1 } }), createClient);

export default router;
