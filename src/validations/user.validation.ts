import joi from 'joi';

const createUser: Record<string, any> = {
  body: joi.object().keys({
    username: joi.string().min(1).max(12).required(),
    email: joi.string().required().email(),
    password: joi.string().min(12).max(36).required(),
    confirmPassword: joi.string().min(12).max(36).required(),
  }),
};

const verifyUser: Record<string, any> = {
  query: joi.object().keys({
    user_id: joi.string().required(),
    token: joi.string().required(),
  }),
};

export default {
  createUser,
  verifyUser,
};
