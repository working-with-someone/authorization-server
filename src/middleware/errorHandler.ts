import { wwsError } from '../error/wwsError';
import { Request, Response, NextFunction } from 'express';
import { sysErrorLogger, webServerLogger } from '../logger/winston';
import httpStatusCode from 'http-status-codes';

const errorHandler = (
  err: wwsError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  //logging system error
  if (err.originError) {
    const originError = err.originError;

    sysErrorLogger.error(originError.message, { stack: originError.stack });
  }

  return res.status(err.status).json(err);
};

export default errorHandler;
