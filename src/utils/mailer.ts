import nodemailer from 'nodemailer';
import { mailerTransportConfig } from '../config/mailer.config';

interface sender {
  src: string;
}

interface defaultConfig {
  dst: string | string[];
}

interface VerificationMailConfig extends defaultConfig {
  verificationLink: string;
}

class Mailer {
  transporter: nodemailer.Transporter;
  sender: sender;
  constructor() {
    this.sender = { src: 'seungho.hub@gmail.com' };
    this.transporter = nodemailer.createTransport(mailerTransportConfig);
  }

  async sendVerificationMail(config: VerificationMailConfig) {
    const messageConfig: nodemailer.SendMailOptions = {
      from: this.sender.src,
      to: config.dst,
      subject: 'verification link',
      html: `<a href='${config.verificationLink}'> click for verification! </a>`,
    };

    return await this.transporter.sendMail(messageConfig);
  }
}

export default new Mailer();
