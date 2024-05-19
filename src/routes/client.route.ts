import { Router } from 'express';
import {
  createClient,
  deleteClient,
  getClient,
  getClients,
  refreshClientSecret,
  updateClient,
  patchClientScope,
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

router.delete(
  '/:clientId',
  validate(clientValidation.deleteClient),
  checkClientExistence,
  deleteClient
);

router.patch(
  '/:clientId/secret',
  validate(clientValidation.refreshClientSecret),
  checkClientExistence,
  refreshClientSecret
);

router.patch(
  '/:clientId/scope',
  validate(clientValidation.patchClientScope),
  checkClientExistence,
  patchClientScope
);

export default router;
