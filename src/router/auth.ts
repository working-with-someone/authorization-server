import { Router } from 'express';
import { renderSignin, renderSignup } from '../controller/auth/';

const authRouter = Router();

authRouter.use('/signin', renderSignin);
authRouter.use('/signup', renderSignup);

export default authRouter;
