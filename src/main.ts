import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { MongoExceptionFilter } from './exception-filters/mongo-exception.filter';
import { configSwagger } from './configs/api-docs.config';
import { TransformInterceptor } from './interceptors/transform.interceptor';
import { MicroserviceOptions } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  app.connectMicroservice<MicroserviceOptions>({
    options: {
      urls: [configService.get<string>('RABBITMQ_URL')],
      queue: 'auth_queue',
    },
  });
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new MongoExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());
  configSwagger(app);
  await app.startAllMicroservices();
  await app.listen(configService.get<number>('PORT') ?? 8080);
}
bootstrap();
