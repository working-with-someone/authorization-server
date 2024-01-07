import { RequestHandler } from 'express';
import { BusboyConfig } from 'busboy';
import { Readable } from 'stream';
declare function minions(options: BusboyConfig): minions.Minions;

declare global {
  namespace Express {
    interface Request {
      file?: minions.File;
      files?: minions.File[];
    }
  }
}

declare namespace minions {
  interface Minions {
    /**
     * file을 포함하지 않는 multipart-form request를 parsing하는 middleware를 return한다.
     */
    zero(): RequestHandler;
    /**
     * single file을 포함하는 multipart-form request를 parsing하는 middleware를 return한다.
     *
     * 'Request' object의 'file' object에 parsing된 file이 attach된다.
     */
    one(): RequestHandler;
    /**
     * 동일한 field name을 사용하는 multiple file이 포함된 request를 parsing하는 middleware를 return한다.
     *
     * 'Request' object의 'files' array에 parsing된 file들이 attach된다.
     *
     * @param max Optional. multipart-form이 포함할 수 있는 file의 수를 제한한다.
     */
    multiple(max?: number): RequestHandler;
  }

  interface File {
    fieldName: string;
    originalName: string;
    encoding: string;
    mimetype: string;
    stream: Readable;
  }
}
