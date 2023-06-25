import { wwsError } from '../utils/wwsError';
import { Request, Response, NextFunction } from 'express';

const errorHandler = (
  err: wwsError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err) {
    return res.render('error/error', { err });
  }
};

export default errorHandler;
