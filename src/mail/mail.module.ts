import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MailerSendMailService } from './mailersend-mail.service';
import { NodemailerMailService } from './nodemailer-mail.service';

@Module({
  imports: [ConfigModule],
  providers: [NodemailerMailService, MailerSendMailService],
  exports: [NodemailerMailService, MailerSendMailService],
})
export class MailModule {}
