import joi from 'joi';

const createUser: Record<string, any> = {
  body: joi.object().keys({
    username: joi.string().min(1).max(12).required(),
    email: joi.string().required().email(),
    password: joi.string().min(12).max(36).required(),
  }),
};

const renderLogin: Record<string, any> = {
  query: joi.object().keys({
    continue: joi.string().uri().required(),
  }),
};

const login: Record<string, any> = {
  body: joi.object().keys({
    //length validation은 필요없다.
    //등록되지 않은 user는 로그인에 실패한다.
    email: joi.string().required(),
    password: joi.string().required(),
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
  renderLogin,
  login,
  verifyUser,
};
