import { Router } from 'express';
import {
  renderSignin,
  signin,
  renderSignup,
  signup,
  verify,
} from '../controller/auth.controller';

import { userValidation } from '../validations';
import validate from '../middleware/validate';

const router = Router();

router.get('/signin', renderSignin);
router.post('/signin', validate(userValidation.signin), signin);
router.get('/signup', renderSignup);
router.post('/signup', validate(userValidation.createUser), signup);
router.get('/signup/verify', validate(userValidation.verifyUser), verify);

export default router;
