import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MailerSendMailService } from './mailersend-mail.service';

@Module({
  imports: [ConfigModule],
  providers: [MailerSendMailService],
  exports: [MailerSendMailService],
})
export class MailModule {}
