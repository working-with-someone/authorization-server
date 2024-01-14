import { Router } from 'express';
import {
  createClient,
  getClient,
  getClients,
} from '../controller/client.controller';

import minion from '../middleware/minions';
import { clientValidation } from '../validations';
import validate from '../middleware/validate';

const router = Router();

router.get('/', getClients);
router.get('/:clientId', validate(clientValidation.getClient), getClient);
router.post(
  '/',
  minion({ limits: { files: 1 } }),
  validate(clientValidation.createClient),
  createClient
);

export default router;
