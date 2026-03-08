import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        transport: {
          host: config.get<string>('MAIL_HOST', 'localhost'),
          port: config.get<number>('MAIL_PORT', 1025),
          ignoreTLS: config.get<boolean>('MAIL_IGNORE_TLS', true),
        },
        defaults: {
          from: config.get<string>('MAIL_FROM', 'test@example.com'),
        },
      }),
    }),
  ],
  exports: [MailerModule],
})
export class MailModule {}
