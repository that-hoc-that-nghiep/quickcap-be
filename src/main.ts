import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { MongoExceptionFilter } from './exception-filters/mongo-exception.filter';
import { configSwagger } from './configs/api-docs.config';
import { TransformInterceptor } from './interceptors/transform.interceptor';
import { MicroserviceOptions } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.connectMicroservice<MicroserviceOptions>({
    options: {
      urls: [`${process.env.RABBITMQ_URL}`],
      queue: 'test_quickcap_queue',
    },
  });
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new MongoExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());
  configSwagger(app);
  await app.startAllMicroservices();
  await app.listen(process.env.PORT ?? 8080);
}
bootstrap();
