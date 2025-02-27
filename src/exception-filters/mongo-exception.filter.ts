import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { MongoServerError } from 'mongodb';
import * as mongoose from 'mongoose';

@Catch(
  MongoServerError,
  mongoose.Error.ValidationError,
  mongoose.Error.CastError,
  mongoose.Error.DocumentNotFoundError,
)
export class MongoExceptionFilter implements ExceptionFilter {
  catch(
    exception:
      | MongoServerError
      | mongoose.Error.ValidationError
      | mongoose.Error.CastError
      | mongoose.Error.DocumentNotFoundError,
    host: ArgumentsHost,
  ) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Unknown error';

    if (exception instanceof MongoServerError) {
      switch (exception.code) {
        case 11000:
          status = HttpStatus.CONFLICT;
          message = `Duplicate data: ${Object.keys(exception.keyValue)}`;
          break;
        default:
          message = 'Unknown MongoDB error';
      }
    } else if (exception instanceof mongoose.Error.ValidationError) {
      status = HttpStatus.BAD_REQUEST;
      message = Object.values(exception.errors)
        .map(
          (err: mongoose.Error.ValidatorError | mongoose.Error.CastError) =>
            err.message,
        )
        .join(', ');
    } else if (exception instanceof mongoose.Error.CastError) {
      status = HttpStatus.BAD_REQUEST;
      message = `Value '${exception.value}' is not a valid ObjectId`;
    } else if (exception instanceof mongoose.Error.DocumentNotFoundError) {
      status = HttpStatus.NOT_FOUND;
      message = 'Document not found in the database';
    }

    response.status(status).json({
      statusCode: status,
      message,
      error: exception.message,
    });
  }
}
