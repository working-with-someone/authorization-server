import { Router } from 'express';
import {
  renderSignin,
  renderSignup,
  redirectToAuth,
  codeCallback,
} from '../controller/auth.controller';

const authRouter = Router();

authRouter.get('/signin', renderSignin);
authRouter.get('/signup', renderSignup);
authRouter.get('/:provider', redirectToAuth);
authRouter.get('/:provider/callback/code', codeCallback);

export default authRouter;
