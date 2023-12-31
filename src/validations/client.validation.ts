import { ValidationSchema } from '../@types/validator';
import joi from 'joi';

const getClient: ValidationSchema = {
  params: joi.object().keys({
    appId: joi.string().required(),
  }),
};

export default {
  getClient,
};
