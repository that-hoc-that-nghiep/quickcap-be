import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { ClientsModule, Transport } from '@nestjs/microservices'
import { RabbitmqService } from './rabbitmq.service'
import { EnvVariables, QUEUE_NAME, SERVICE_NAME } from 'src/constants'


@Module({
    imports: [
        ClientsModule.registerAsync([
            {
                name: SERVICE_NAME,
                imports: [ConfigModule],
                useFactory: (configService: ConfigService) => ({
                    transport: Transport.RMQ,
                    options: {
                        urls: [configService.get<string>(EnvVariables.RABBITMQ_URL) || 'amqp://localhost:5672'],
                        queue: QUEUE_NAME,
                        queueOptions: {
                            durable: true
                        }
                    }
                }),
                inject: [ConfigService]
            }
        ])
    ],
    providers: [RabbitmqService],
    exports: [RabbitmqService]
})
export class RabbitmqModule {}
