import { Request, Response, NextFunction } from 'express';
import httpStatusCode from 'http-status-codes';
import { wwsError } from '../../error/wwsError';
import { isClientExist } from '../../services/client.service';
import asyncCatch from '../../utils/asyncCatch';

// client의 존재 여부를 확인하는 middleware
// isClientExist가 다른 user의 client를 hide하기 위해 user_id를 사용하기 때문에 권한이 없는 client에 대해서도 존재하지 않음으로 판정하고 404를 응답한다.
const checkClientExistence = asyncCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!(await isClientExist(req.user.id, req.params.clientId))) {
      return next(
        new wwsError(
          httpStatusCode.NOT_FOUND,
          httpStatusCode.getStatusText(httpStatusCode.NOT_FOUND)
        )
      );
    }

    next();
  }
);

export { checkClientExistence };
