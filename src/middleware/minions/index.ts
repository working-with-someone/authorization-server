import busboy from 'busboy';
import { FieldAppender, FileAppender } from './lib/appender';
import { Request, Response } from 'express';
import contentType from 'content-type';
import { wwsError } from '../../error/wwsError';
import { NextFunction } from 'express-serve-static-core';
import asyncCatch from '../../utils/asyncCatch';
import { PassThrough } from 'stream';
import { IncomingHttpHeaders } from 'http';

const formTypes = ['multipart/form-data'];

const getContentType = (req: Request) => contentType.parse(req).type;

export interface File {
  fieldName: string;
  originalName: string;
  encoding: string;
  mimetype: string;
  stream: PassThrough;
}

export interface Field {
  fieldName: string;
  value: string;
}

/**
 * all of config is same as busboy.BusboyConfig except Config.limits.files being required
 */
interface Config {
  headers?: IncomingHttpHeaders | undefined;
  highWaterMark?: number | undefined;
  fileHwm?: number | undefined;
  defCharset?: string | undefined;
  defParamCharset?: string | undefined;
  preservePath?: boolean | undefined;
  limits: Limits;
}

interface Limits {
  fieldNameSize?: number | undefined;
  fieldSize?: number | undefined;
  fields?: number | undefined;
  fileSize?: number | undefined;
  files: number;
  parts?: number | undefined;
  headerPairs?: number | undefined;
}

function minion(options: Config) {
  return asyncCatch(async function formBodyParser(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const contentType = getContentType(req);

    // request가 support하지 않는 content type을 사용한다면 pass한다.
    if (!formTypes.includes(contentType)) {
      throw new wwsError(400, 'Invalid content type');
    }

    req.body = Object.create(null);

    const bb = busboy({
      headers: req.headers,
      ...options,
    });

    const fieldAppender = new FieldAppender(req);

    bb.on('field', (name, value, info) => {
      fieldAppender.append({ fieldName: name, value });
    });

    const fileAppender = new FileAppender(req, options.limits.files);

    bb.on('file', (name, stream, fileInfo) => {
      const _stream = new PassThrough();
      stream.pipe(_stream);

      const file: File = {
        fieldName: name,
        originalName: fileInfo.filename,
        encoding: fileInfo.encoding,
        mimetype: fileInfo.mimeType,
        stream: _stream,
      };

      fileAppender.append(file);

      //file stream of busboy must be resumed for emit 'finish' event
      stream.resume();
    });

    bb.on('close', () => {
      done();
    });

    bb.on('error', (err) => {
      done(err);
    });

    function done(err?: any) {
      req.unpipe(bb);

      if (err) {
        throw new wwsError(500, 'failed parsing formdata', err);
      }

      return next();
    }

    req.pipe(bb);
  });
}

export default minion;
