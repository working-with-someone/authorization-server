import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import httpStatusCode from 'http-status-codes';
import { wwsError } from '../error/wwsError';
import { isExist } from '../services/user.service';
import { PublicUserInfo } from '../@types/express/user';

const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split('Bearer ')[1];

  if (token) {
    try {
      const info = jwt.verify(
        token,
        process.env.TOKEN_USER_SECRET as string
      ) as JwtPayload;

      if (!(await isExist(info.id))) {
        throw new Error();
      }

      req.user = info as PublicUserInfo;

      next();
    } catch (err) {
      return next(
        new wwsError(
          httpStatusCode.UNAUTHORIZED,
          httpStatusCode.getStatusText(httpStatusCode.UNAUTHORIZED)
        )
      );
    }
  } else {
    return next(
      new wwsError(
        httpStatusCode.UNAUTHORIZED,
        httpStatusCode.getStatusText(httpStatusCode.UNAUTHORIZED)
      )
    );
  }
};

export { authMiddleware };
