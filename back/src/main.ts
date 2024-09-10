import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: 'http://localhost:3000', // Allow requests from this origin
    methods: 'GET,POST,PUT,PATCH,DELETE,OPTIONS', // Allowed methods
    credentials: true, // Allow cookies to be sent
  });

  await app.listen(3001);
}
bootstrap();
