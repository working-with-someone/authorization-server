import { Router } from 'express';
import {
  createClient,
  getClient,
  getClients,
  updateClient,
} from '../controller/client.controller';

import minion from '../middleware/minions';
import { clientValidation } from '../validations';
import validate from '../middleware/validate';
import { checkClientExistence } from '../middleware/client/client.middleware';
const router = Router();

router.get('/', getClients);
router.get(
  '/:clientId',
  validate(clientValidation.getClient),
  checkClientExistence,
  getClient
);
router.post(
  '/',
  minion({ limits: { files: 1 } }),
  validate(clientValidation.createClient),
  createClient
);

router.put(
  '/:clientId',
  minion({ limits: { files: 1 } }),
  validate(clientValidation.updateClient),
  checkClientExistence,
  updateClient
);

export default router;
