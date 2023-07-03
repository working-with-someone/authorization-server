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
    const originError = err.originError;

    sysErrorLogger.error(originError.message, { stack: originError.stack });

    return res.render('error/error', { err });
  }
};

export default errorHandler;
