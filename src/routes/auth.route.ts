import { Request, Response, Router } from 'express';
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

router.post('/publish', (req: Request, res: Response) => {
  console.log(req.body);

  return res.status(200).end();
});
export default router;
