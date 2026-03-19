import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        // Prefer MAIL_* keys; fallback to legacy HOSTINGER_* keys.
        const host =
          config.get<string>('MAIL_HOST') ??
          config.get<string>('HOSTINGER_SMTP_HOST') ??
          'smtp.hostinger.com';

        const portRaw =
          config.get<string>('MAIL_PORT') ??
          config.get<string>('HOSTINGER_SMTP_PORT') ??
          '465';
        const port = Number(portRaw);

        const user =
          config.get<string>('MAIL_USER') ??
          config.get<string>('HOSTINGER_EMAIL') ??
          '';
        const pass =
          config.get<string>('MAIL_PASS') ??
          config.get<string>('HOSTINGER_PASSWORD') ??
          '';

        const secureEnv = config.get<string>('MAIL_SECURE');
        const secure =
          secureEnv != null
            ? ['true', '1', 'yes'].includes(secureEnv.toLowerCase())
            : port === 465; // Match POC: port 465 => secure SSL

        return {
          transport: {
            host,
            port,
            secure,
            auth: { user, pass },
            ignoreTLS: config.get<boolean>('MAIL_IGNORE_TLS', false),
          },
          defaults: {
            from:
              config.get<string>('MAIL_FROM') ??
              user ??
              'test@example.com',
          },
        };
      },
    }),
  ],
  exports: [MailerModule],
})
export class MailModule {}
