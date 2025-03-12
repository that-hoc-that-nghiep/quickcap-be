import { ArgumentsHost, Catch, ExceptionFilter, Logger } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { RpcException } from '@nestjs/microservices';
@Catch(RpcException)
export class RabbitMQExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(RabbitMQExceptionFilter.name);

  catch(exception: RpcException, host: ArgumentsHost): Observable<any> {
    const errorMessage = exception?.message || 'Unknown error';

    if (
      errorMessage.includes(
        'There is no matching message handler defined in the remote service',
      )
    ) {
      this.logger.error(`RabbitMQ Handler Not Found: ${exception?.message}`);
      this.logger.debug('Stack trace:', exception?.stack);
      return throwError(
        () =>
          new RpcException('Service not found. Please check the service name'),
      );
    }

    this.logger.error(`RabbitMQ Exception: ${exception?.message}`);
    this.logger.debug('Stack trace:', exception?.stack);
    return throwError(() => new RpcException(errorMessage));
  }
}
