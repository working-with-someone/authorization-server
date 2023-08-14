import joi from 'joi';
import OAuths from '../lib/api';

const oauthRequestValidation: Record<string, any> = {
  param: joi.object().keys({
    provider: joi.string().valid(...Object.keys(OAuths)),
  }),
};

export default {
  oauthRequestValidation,
};
