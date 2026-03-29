import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MailerSendMailService } from './mailersend-mail.service';
import { SmtpApiMailService } from './smtp-api-mail.service';

@Module({
  imports: [ConfigModule],
  providers: [MailerSendMailService, SmtpApiMailService],
  exports: [MailerSendMailService, SmtpApiMailService],
})
export class MailModule {}
