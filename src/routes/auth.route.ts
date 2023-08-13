import { Router } from 'express';
import {
  renderSignin,
  renderSignup,
  redirectToAuth,
  codeCallback,
} from '../controller/auth.controller';

const router = Router();

router.get('/signin', renderSignin);
router.get('/signup', renderSignup);
router.get('/:provider', redirectToAuth);
router.get('/:provider/callback/code', codeCallback);

export default router;
