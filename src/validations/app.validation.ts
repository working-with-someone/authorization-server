import joi from 'joi';

const getApp: Record<string, any> = {
  params: joi.object().keys({
    appId: joi.string().required(),
  }),
};

export default {
  getApp,
};
