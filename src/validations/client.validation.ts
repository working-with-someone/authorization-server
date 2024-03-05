import { ValidationSchema } from '../@types/validator';
import joi from 'joi';
import { stringBase } from './base';

const getClient: ValidationSchema = {
  params: joi.object().keys({
    clientId: joi.string().required(),
  }),
};

const createClient: ValidationSchema = {
  body: joi.object().keys({
    client_name: stringBase.withoutSpecialChar().required(),
    client_uri: joi.string().uri().required(),
  }),
};

const updateClient: ValidationSchema = {
  body: joi.object().keys({
    client_name: stringBase.withoutSpecialChar().required(),
    client_uri: joi.string().uri().required(),
    redirect_uri1: joi.string().uri(),
    redirect_uri2: joi.string().uri(),
    redirect_uri3: joi.string().uri(),
    redirect_uri4: joi.string().uri(),
    redirect_uri5: joi.string().uri(),
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
