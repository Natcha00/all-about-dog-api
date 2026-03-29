import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  MailerSend,
  EmailParams,
  Sender,
  Recipient,
} from 'mailersend';

type SendMailInput = {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  /** Optional override: `email` or `Name <email@domain.com>` */
  from?: string;
};

function htmlToPlainText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .trim();
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * MailerSend HTTP API (optional). App email traffic uses {@link NodemailerMailService}.
 * Register for future use or inject where needed.
 */
@Injectable()
export class MailerSendMailService {
  private readonly logger = new Logger(MailerSendMailService.name);
  private readonly mailerSend: MailerSend | null;
  private readonly defaultFromEmail: string;
  private readonly defaultFromName: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey =
      this.configService.get<string>('API_KEY') ??
      this.configService.get<string>('MAILERSEND_API_KEY');

    this.defaultFromEmail =
      this.configService.get<string>('MAILERSEND_FROM_EMAIL') ??
      'aboutdog@test-eqvygm0703zl0p7w.mlsender.net';
    this.defaultFromName =
      this.configService.get<string>('MAILERSEND_FROM_NAME') ?? 'All About Dog';

    if (apiKey) {
      this.mailerSend = new MailerSend({ apiKey });
    } else {
      this.mailerSend = null;
      this.logger.warn(
        'MailerSendMailService: no MAILERSEND_API_KEY — sendMail disabled until configured.',
      );
    }
  }

  private resolveSender(override?: string): { email: string; name: string } {
    const trimmed = override?.trim();
    if (!trimmed) {
      return {
        email: this.defaultFromEmail,
        name: this.defaultFromName,
      };
    }
    const angle = trimmed.match(/^(.+?)\s*<([^>]+)>$/);
    if (angle) {
      const name = angle[1].trim().replace(/^"|"$/g, '');
      return { name, email: angle[2].trim() };
    }
    return { email: trimmed, name: '' };
  }

  async sendMail(input: SendMailInput): Promise<void> {
    if (!this.mailerSend) {
      throw new Error(
        'MailerSend is not configured (set MAILERSEND_API_KEY or API_KEY)',
      );
    }

    const { email: fromEmail, name: fromName } = this.resolveSender(
      input.from,
    );
    const sentFrom = new Sender(fromEmail, fromName || undefined);
    const recipients = [new Recipient(input.to, '')];

    const textBody =
      (input.text ??
        (input.html ? htmlToPlainText(input.html) : '')) ||
      ' ';
    const htmlBody =
      input.html ??
      (input.text
        ? `<p>${escapeHtml(input.text).replace(/\n/g, '<br>')}</p>`
        : `<p>${escapeHtml(textBody)}</p>`);

    const emailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo(recipients)
      .setReplyTo(new Recipient(fromEmail, fromName || undefined))
      .setSubject(input.subject)
      .setText(textBody)
      .setHtml(htmlBody);

    const res = await this.mailerSend.email.send(emailParams);
    if (res.statusCode >= 400) {
      this.logger.error(
        `MailerSend error: ${res.statusCode} ${JSON.stringify(res.body)}`,
      );
      throw new Error(
        `MailerSend failed: ${res.statusCode} ${JSON.stringify(res.body)}`,
      );
    }
    this.logger.debug(`Email sent to ${input.to}`);
  }
}
