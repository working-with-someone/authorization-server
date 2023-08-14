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

export default {
  oauthRequestValidation,
};
