import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // IMPORTANT FOR PRODUCTION: Enable 'trust proxy' so Throttler and other services
  // work correctly behind reverse proxies (e.g., Nginx, Heroku, Render).
  // app.set('trust proxy', 1);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Phoenix API')
    .setDescription('Dokumentácia API')
    .setVersion('1.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT', in: 'header' }, 'bearer')
    .addServer('http://localhost:3000')
    .build();
  const document = SwaggerModule.createDocument(app, config, { deepScanRoutes: true });
  SwaggerModule.setup('/api-docs', app, document);

  // Expose raw OpenAPI JSON
  app.getHttpAdapter().get('/openapi.json', (req, res) => res.json(document));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
