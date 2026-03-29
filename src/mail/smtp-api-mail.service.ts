import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export type SmtpApiSendMailInput = {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  from?: string;
};

/**
 * POST JSON to external SMTP API (e.g. Render nodemailer service).
 * Env: API_SEND_EMAIL_URL
 */
@Injectable()
export class SmtpApiMailService {
  private readonly logger = new Logger(SmtpApiMailService.name);

  constructor(private readonly configService: ConfigService) {}

  async sendMail(input: SmtpApiSendMailInput): Promise<void> {
    const url = this.configService.get<string>('API_SEND_EMAIL_URL')?.trim();
    if (!url) {
      throw new Error('Missing API_SEND_EMAIL_URL');
    }

    const isHtml = Boolean(input.html?.trim());
    const body = isHtml
      ? (input.html ?? '')
      : (input.text ?? (input.html ? input.html : ''));

    const payload = {
      to: input.to,
      subject: input.subject,
      body: body || ' ',
      is_html: isHtml,
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const responseText = await res.text();
    if (!res.ok) {
      this.logger.error(`SMTP API send failed: ${res.status} ${responseText}`);
      throw new Error(`SMTP API send failed: ${res.status} ${responseText}`);
    }
    this.logger.debug(`Email sent via SMTP API to ${input.to}`);
  }
}
