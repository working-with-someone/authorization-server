import { wwsError } from '../utils/wwsError';
import { Request, Response, NextFunction } from 'express';
import { sysErrorLogger } from '../logger/winston';

const errorHandler = (
  err: wwsError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err) {
    sysErrorLogger.error(err.originError);

    return res.render('error/error', { err });
  }
};

export default errorHandler;
