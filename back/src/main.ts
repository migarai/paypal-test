import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';
import * as dotenv from 'dotenv';



async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // app.use('/paypal/webhook', express.raw({ type: 'application/json' }));
  dotenv.config(); // Load environment variables from .env file
  app.use(express.json());

  // Enable CORS
  app.enableCors();

  await app.listen(3001);
}
bootstrap();
