import { UseInterceptors, applyDecorators } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { ApiBody, ApiConsumes, ApiQuery } from '@nestjs/swagger';
import {
  ReferenceObject,
  SchemaObject,
} from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import { SwaggerArrayConversion } from 'src/interceptors/swagger-array.interceptor';

export function ApiBodyWithSingleFile(
  name = 'file',
  body_properties?: object,
  required_properties?: string[],
  local_options?: MulterOptions,
) {
  let properties: Record<string, SchemaObject | ReferenceObject>;
  const api_body = {
    schema: {
      type: 'object',
      properties,
      required: required_properties,
    },
  };
  if (!body_properties) {
    api_body.schema = {
      ...api_body.schema,
      properties: {
        [name]: {
          type: 'string',
          format: 'binary',
        },
      },
    };
  } else {
    api_body.schema = {
      ...api_body.schema,
      properties: {
        ...body_properties,
        [name]: {
          type: 'string',
          format: 'binary',
        },
      },
    };
  }
  return applyDecorators(
    ApiConsumes('multipart/form-data'),
    ApiBody(api_body),
    UseInterceptors(FileInterceptor(name, local_options)),
  );
}

export function ApiDocsPagination(entity: string) {
  return applyDecorators(
    ApiQuery({
      name: 'page',
      type: Number,
      examples: {
        '1': {
          value: 1,
          description: 'page 1',
        },
        '2': {
          value: 2,
          description: `page 2`,
        },
        '3': {
          value: 3,
          description: `page 3`,
        },
        '4': {
          value: 4,
          description: `page 4`,
        },
        '5': {
          value: 5,
          description: `page 5`,
        },
      },
    }),
    ApiQuery({
      name: 'limit',
      type: Number,
      examples: {
        '5': {
          value: 5,
          description: `Get 5 ${entity}s`,
        },
        '10': {
          value: 10,
          description: `Get 10 ${entity}s`,
        },
        '15': {
          value: 15,
          description: `Get 15 ${entity}s`,
        },
      },
    }),
    ApiQuery({
      name: 'keyword',
      type: String,
      required: false,
      description: 'Search by title video',
    }),
    ApiQuery({
      name: 'categoryId',
      type: String,
      required: false,
      description: 'Filter by category id',
    }),
    ApiQuery({
      name: 'order',
      enum: ['asc', 'desc'],
      required: false,
      description: 'Filter by order asc or desc',
    }),
  );
}
