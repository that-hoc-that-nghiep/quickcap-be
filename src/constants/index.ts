export const EnvVariables: Record<string, string> = {
  DATABASE_URL: 'DATABASE_URL',
  DATABASE_LOCAL_URL: 'DATABASE_LOCAL_URL',
  PORT: 'PORT',
  API_DOCS_URL: 'API_DOCS_URL',
  API_DOC_USERNAME: 'API_DOC_USERNAME',
  API_DOC_PASSWORD: 'API_DOC_PASSWORD',
  RABBITMQ_URL: 'RABBITMQ_URL',
  REDIS_HOST: 'REDIS_HOST',
  REDIS_PORT: 'REDIS_PORT',
  REDIS_USERNAME: 'REDIS_USERNAME',
  REDIS_PASSWORD: 'REDIS_PASSWORD',
  ACCESS_KEY: 'ACCESS_KEY',
  SECRET_KEY: 'SECRET_KEY',
  BUCKET_REGION: 'BUCKET_REGION',
  BUCKET_NAME: 'BUCKET_NAME',
  MAILER_HOST: 'MAILER_HOST',
  MAILER_PORT: 'MAILER_PORT',
  MAILER_EMAIL: 'MAILER_EMAIL',
  MAILER_PASSWORD: 'MAILER_PASSWORD',
  AUTH_URL: 'AUTH_URL',
};

export enum VideoCategory {
  DRAWING = 'Drawing',
  HENTAI = 'Hentai',
  NEUTRAL = 'Neutral',
  PORN = 'Porn',
  SEXY = 'Sexy',
}

export const QUEUE_NAME = 'quickcap';
export const QUEUE_NAME_2 = 'quickcap-nsfw';
export const SERVICE_NAME = 'quickcap-ai';
