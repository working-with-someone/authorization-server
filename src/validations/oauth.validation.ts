import joi from 'joi';
import OAuths from '../lib/api';

const providerValidation: Record<string, any> = {
  //path parameter 'provider' required and must be one of registered OAuth Provider
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
    //require authorization code in query parameters
    .keys({
      code: joi.string().required(),
    })
    //allow other callback query parameters
    .unknown(),
};

export default {
  oauthRequestValidation,
  authorizationCodeCallbackValidations,
};
