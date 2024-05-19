import { ArraySchema, ObjectSchema } from 'joi';

export interface ValidationSchema {
  params?: ObjectSchema<any>;
  query?: ObjectSchema<any>;
  body?: ObjectSchema<any> | ArraySchema<any>;
}
