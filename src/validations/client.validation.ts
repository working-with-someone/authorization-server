import { ValidationSchema } from '../@types/validator';
import joi from 'joi';

const getClient: ValidationSchema = {
  params: joi.object().keys({
    clientId: joi.string().required(),
  }),
};

const createClient: ValidationSchema = {
  body: joi.object().keys({
    name: joi.string().required(),
    uri: joi.string().uri().required(),
  }),
};

const updateClient: ValidationSchema = {
  body: joi.object().keys({
    name: joi.string().required(),
    uri: joi.string().uri().required(),
  }),
  params: joi.object().keys({
    clientId: joi.string().required(),
  }),
};
export default {
  getClient,
  createClient,
  updateClient,
};
