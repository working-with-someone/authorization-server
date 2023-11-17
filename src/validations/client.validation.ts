import joi from 'joi';

const getClient: Record<string, any> = {
  params: joi.object().keys({
    appId: joi.string().required(),
  }),
};

export default {
  getClient,
};
