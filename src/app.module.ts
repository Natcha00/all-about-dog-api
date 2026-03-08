import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { OfferingModule } from './offering/offering.module';
import { DogModule } from './dog/dog.module';
import { StorageModule } from './storage/storage.module';
import { StaffModule } from './staff/staff.module';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    MailModule,
    DogModule,
    OfferingModule,
    StorageModule,
    StaffModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
