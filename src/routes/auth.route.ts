import { Router } from 'express';
import {
  renderSignin,
  renderSignup,
  signup,
  redirectToAuth,
  codeCallback,
} from '../controller/auth.controller';

import { oauthValidation, userValidation } from '../validations';
import validate from '../middleware/validate';

const router = Router();

router.get('/signin', renderSignin);
router.get('/signup', renderSignup);
router.post('/signup', validate(userValidation.createUser), signup);
router.get(
  '/:provider',
  validate(oauthValidation.oauthRequestValidation),
  redirectToAuth
);
router.get('/:provider/callback/code', codeCallback);

export default router;
