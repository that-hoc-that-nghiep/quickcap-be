import { HttpException, HttpStatus, Logger } from '@nestjs/common';
import { AxiosError } from 'axios';

export function createErrorHandler(
  logger: Logger,
  serviceName: string,
  customMessages: {
    logPrefix?: string;
    unauthorizedMessage?: string;
    defaultMessage?: string;
  } = {},
) {
  return async (error: AxiosError) => {
    const errorData = error.response?.data;
    const errorParse =
      typeof errorData === 'object' ? JSON.stringify(errorData) : errorData;

    const logPrefix = customMessages.logPrefix || `Error in ${serviceName}`;
    logger.error(`${logPrefix}: ${errorParse}`);

    if (error.response?.status === 401) {
      const res = {
        status: 401,
        message:
          customMessages.unauthorizedMessage ||
          `Error in ${serviceName}: Invalid token`,
        error: 'Unauthorized',
      };
      throw new HttpException(`${res.message}`, res.status, {
        cause: new Error(),
        description: 'Unauthorized',
      });
    }

    throw new HttpException(
      {
        statusCode: error.response?.status || 500,
        message: customMessages.defaultMessage || `Error in ${serviceName}`,
      },
      error.response?.status || 500,
      {
        cause: new Error(),
        description: customMessages.defaultMessage || `Error in ${serviceName}`,
      },
    );
  };
}
