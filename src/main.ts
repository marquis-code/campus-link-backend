import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { SeedService } from './common/services/seed.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Seeding
  const seedService = app.get(SeedService);
  await seedService.seed();

  // CORS - allow all origins
  app.enableCors({
    origin: (origin, callback) => {
      // Allow all origins (for development and production flexibility)
      callback(null, true);
    },
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders:
      'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-xsrf-token',
    exposedHeaders: 'Content-Range,X-Content-Range',
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global prefix
  app.setGlobalPrefix('api');

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 CampusLink API running on http://0.0.0.0:${port}/api`);
}
bootstrap();
