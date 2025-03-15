import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { MongoExceptionFilter } from './exception-filters/mongo-exception.filter';
import { TransformInterceptor } from './interceptors/transform.interceptor';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from './auth/auth.guard';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { EnvVariables } from './constants';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { RabbitMQExceptionFilter } from './exception-filters/rabbitmq-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug'],
  });
  const configService = app.get(ConfigService);
  app.enableCors({ origin: '*' });
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
  app.useGlobalFilters(
    new MongoExceptionFilter(),
    new RabbitMQExceptionFilter(),
  );
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalInterceptors(app.get(CacheInterceptor));
  const rmqUrl = configService.get('RABBITMQ_URL') || 'amqp://localhost:5672';
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [rmqUrl],
      queue: configService.get<string>(EnvVariables.QUEUE_NAME_2),
      queueOptions: {
        durable: true,
      },
    },
  });
  await app.startAllMicroservices();
  await app.listen(configService.get<number>(EnvVariables.PORT) ?? 8080);
}
bootstrap();
