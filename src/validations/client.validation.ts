import { ValidationSchema } from '../@types/validator';
import joi from 'joi';
import { stringBase, objectBase } from './joi/baseSchema';

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
    logo_update_option: joi
      .string()
      .equal('no-change', 'update', 'delete')
      .required(),
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

const deleteClient: ValidationSchema = {
  params: joi.object().keys({
    clientId: joi.string().required(),
  }),
};

const refreshClientSecret: ValidationSchema = {
  params: joi.object().keys({
    clientId: joi.string().required(),
  }),
};

const patchClientScope: ValidationSchema = {
  params: joi.object().keys({
    clientId: joi.string().required(),
  }),
  body: joi.array().items(
    objectBase.patchDocument({
      op: ['replace'],
      path: '/',
      value: true,
    })
  ),
};

export default {
  getClient,
  createClient,
  updateClient,
  deleteClient,
  refreshClientSecret,
  patchClientScope,
};
