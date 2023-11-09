import { Router } from 'express';
import {
  renderLogin,
  login,
  renderSignup,
  signup,
  verify,
} from '../controller/auth.controller';

import { userValidation } from '../validations';
import validate from '../middleware/validate';

const router = Router();

router.get('/login', validate(userValidation.renderLogin), renderLogin);
router.post('/login', validate(userValidation.login), login);
router.get('/signup', renderSignup);
router.post('/signup', validate(userValidation.createUser), signup);
router.get('/signup/verify', validate(userValidation.verifyUser), verify);

export default router;
