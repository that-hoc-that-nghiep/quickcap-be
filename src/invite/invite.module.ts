import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Invite, InviteSchema } from './invite.schema';
import { InviteService } from './invite.service';
import { InviteController } from './invite.controller';
import { InviteRepository } from './invite.repository';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from 'src/auth/auth.module';
import { EnvVariables } from 'src/constants';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Invite.name, schema: InviteSchema }]),
    MailerModule.forRootAsync({
      inject: [ConfigService],
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>(EnvVariables.MAILER_HOST),
          port: configService.get<number>(EnvVariables.MAILER_PORT),
          auth: {
            user: configService.get<string>(EnvVariables.MAILER_EMAIL),
            pass: configService.get<string>(EnvVariables.MAILER_PASSWORD),
          },
        },
      }),
    }),
    AuthModule,
  ],
  providers: [InviteService, InviteRepository],
  controllers: [InviteController],
})
export class InviteModule {}
