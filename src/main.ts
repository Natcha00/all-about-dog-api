import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger();
  const port = process.env.PORT ?? 3001;
  logger.debug(`server is running on port : ${port}`);
  await app.listen(port);
}
bootstrap();
