import joi from 'joi';
import OAuths from '../lib/api';

const providerValidation: Record<string, any> = {
  provider: joi.string().valid(...Object.keys(OAuths)),
};

const oauthRequestValidation: Record<string, any> = {
  params: joi.object().keys({
    ...providerValidation,
  }),
};

const authorizationCodeCallbackValidations: Record<string, any> = {
  params: joi.object().keys({
    ...providerValidation,
  }),
  query: joi
    .object()
    .keys({
      code: joi.string().required(),
    })
    .unknown(),
};

export default {
  oauthRequestValidation,
  authorizationCodeCallbackValidations,
};
