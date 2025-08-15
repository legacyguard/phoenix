import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

async function main() {
  const app = await NestFactory.create(AppModule, { logger: false });

  const config = new DocumentBuilder()
    .setTitle('Phoenix API')
    .setDescription('Dokumentácia API')
    .setVersion('1.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT', in: 'header' }, 'bearer')
    .addServer('http://localhost:3000')
    .build();

  const document = SwaggerModule.createDocument(app, config, { deepScanRoutes: true });

  const outPath = resolve(process.cwd(), 'openapi.json');
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, JSON.stringify(document, null, 2), 'utf-8');
  await app.close();
  // eslint-disable-next-line no-console
  console.log(`OpenAPI spec exported to ${outPath}`);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
