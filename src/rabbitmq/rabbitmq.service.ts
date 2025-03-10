import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, Observable, catchError, throwError } from 'rxjs';
import { SERVICE_NAME } from 'src/constants';

@Injectable()
export class RabbitmqService {
  private readonly logger = new Logger(RabbitmqService.name);

  constructor(@Inject(SERVICE_NAME) private readonly client: ClientProxy) {}

  async onApplicationBootstrap() {
    try {
      await this.client.connect();
      this.logger.log('Successfully connected to RabbitMQ');
    } catch (error) {
      this.logger.error('Failed to connect to RabbitMQ', error);
    }
  }

  sendMessage<T>(pattern: any, data: any): Observable<T> {
    this.logger.debug(`Sending message to ${JSON.stringify(pattern)}`);

    return this.client.send<T>(pattern, data).pipe(
      catchError((error) => {
        if (error?.message?.includes('There is no matching message handler')) {
          this.logger.error(
            `No handler found for pattern: ${JSON.stringify(pattern)}`,
          );
          return throwError(
            () => new Error(`Not found handler for ${JSON.stringify(pattern)}`),
          );
        }
        this.logger.error(
          `Error preparing message to ${JSON.stringify(pattern)}`,
          error,
        );
        return throwError(() => error);
      }),
    );
  }

  emitEvent(pattern: string, data: any): void {
    try {
      this.client.emit(pattern, data);
      this.logger.debug(`Event emitted to ${pattern}`);
    } catch (error) {
      this.logger.error(`Error emitting event to ${pattern}`, error);
      throw error;
    }
  }
}
