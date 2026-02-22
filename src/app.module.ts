import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { OfferingModule } from './offering/offering.module';
import { DogModule } from './dog/dog.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    DogModule,
    OfferingModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
