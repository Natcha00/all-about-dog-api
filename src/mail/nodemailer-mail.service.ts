import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

export type NodemailerSendMailInput = {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  from?: string;
};

/**
 * SMTP via nodemailer (MAIL_* / Hostinger legacy env).
 * Not wired into use cases by default; inject when you want to switch from MailerSend.
 */
@Injectable()
export class NodemailerMailService {
  private readonly logger = new Logger(NodemailerMailService.name);
  private readonly transporter: Transporter;
  private readonly defaultFrom: string;

  constructor(private readonly configService: ConfigService) {
    const host =
      this.configService.get<string>('MAIL_HOST') ??
      this.configService.get<string>('HOSTINGER_SMTP_HOST') ??
      'smtp.hostinger.com';

    const portRaw =
      this.configService.get<string>('MAIL_PORT') ??
      this.configService.get<string>('HOSTINGER_SMTP_PORT') ??
      '465';
    const port = Number(portRaw);

    const user =
      this.configService.get<string>('MAIL_USER') ??
      this.configService.get<string>('HOSTINGER_EMAIL') ??
      '';
    const pass =
      this.configService.get<string>('MAIL_PASS') ??
      this.configService.get<string>('HOSTINGER_PASSWORD') ??
      '';

    const secureEnv = this.configService.get<string>('MAIL_SECURE');
    const secure =
      secureEnv != null
        ? ['true', '1', 'yes'].includes(secureEnv.toLowerCase())
        : port === 465;

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
      ignoreTLS: this.configService.get<boolean>('MAIL_IGNORE_TLS', false),
    });

    this.defaultFrom =
      this.configService.get<string>('MAIL_FROM') ??
      user ??
      'test@example.com';
  }

  async sendMail(input: NodemailerSendMailInput): Promise<void> {
    await this.transporter.sendMail({
      from: input.from ?? this.defaultFrom,
      to: input.to,
      subject: input.subject,
      text: input.text,
      html: input.html,
    });
    this.logger.debug(`Email sent to ${input.to} (nodemailer)`);
  }
}
