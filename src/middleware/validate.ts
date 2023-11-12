import joi from 'joi';
import httpStatusCode from 'http-status-codes';
import pick from '../utils/pick';
import { wwsError } from '../error/wwsError';
import { NextFunction, Request, Response } from 'express';

const validate =
  (schema: Record<string, any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    //validation에 params, query, body라는 key를 가진 validation을 가져온다.
    const validSchema = pick(schema, ['params', 'query', 'body']);
    //request에서 validSchema에 포함된 key에 해당하는 data들을 가져온다.
    const object = pick(req, Object.keys(validSchema));

    //validSchema에 포함된 validation으로 request의 data를 compile한다.
    const { value, error } = joi
      .compile(validSchema)
      .prefs({ errors: { label: 'key' }, abortEarly: false })
      .validate(object);

    //validation을 통과하지 못한다면 400과 error message를 응답한다.
    if (error) {
      const errorMessage = error.details
        .map((details) => details.message)
        .join(', ');

      return next(new wwsError(httpStatusCode.BAD_REQUEST, errorMessage));
    }

    //다시 해당 value를 data들을 할당한다.
    //ex) Object.assign(req, {body : {..}, query : {..})
    Object.assign(req, value);

    //next
    return next();
  };

export default validate;
