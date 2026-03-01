import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DoSpacesService } from './do-spaces.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [DoSpacesService],
  exports: [DoSpacesService],
})
export class StorageModule {}
