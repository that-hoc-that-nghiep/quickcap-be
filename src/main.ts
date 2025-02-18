import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { MongoExceptionFilter } from './exception-filters/mongo-exception.filter';
import { TransformInterceptor } from './interceptors/transform.interceptor';
import { MicroserviceOptions } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from './auth/auth.guard';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { EnvVariables } from './constants';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.connectMicroservice<MicroserviceOptions>({
    options: {
      urls: [configService.get<string>(EnvVariables.RABBITMQ_URL)],
      queue: 'auth_queue',
    },
  });
  app.setGlobalPrefix('api/v1');
  const config = new DocumentBuilder()
    .setTitle('Quickcap Project')
    .setDescription('The Quickcap API description')
    .setVersion('0.1')
    .addSecurity('token', { type: 'http', scheme: 'bearer' })
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });
  app.useGlobalGuards(app.get(AuthGuard));
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new MongoExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  await app.startAllMicroservices();
  await app.listen(configService.get<number>(EnvVariables.PORT) ?? 8080);
}
bootstrap();
