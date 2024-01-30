import { SessionOptions, CookieOptions } from 'express-session';

const cookieConfig: CookieOptions = {
  secure: false,
  domain: process.env.DOMAIN,
  httpOnly: true,
};

if (process.env.NODE_ENV === 'production') {
  cookieConfig.secure = true;
}

const sessionConfig: SessionOptions = {
  name: '_dev_sid',
  secret: process.env.APP_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: cookieConfig,
};

export default sessionConfig;
