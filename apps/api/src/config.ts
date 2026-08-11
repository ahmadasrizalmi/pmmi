import { z } from 'zod';

const emptyToUndefined=(value:unknown)=>typeof value==='string'&&value.trim()===''?undefined:value;
const optionalString=(schema:z.ZodTypeAny=z.string())=>z.preprocess(emptyToUndefined,schema.optional());

const schema = z.object({
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(32),
  BOOTSTRAP_ADMIN_TOKEN: optionalString(z.string().min(16)),
  MINIO_ENDPOINT: z.string().url(),
  MINIO_ACCESS_KEY: z.string().min(1),
  MINIO_SECRET_KEY: z.string().min(1),
  MINIO_BUCKET: z.string().default('pmmi'),
  PORT: z.coerce.number().int().positive().default(3001),
  HOST: z.string().default('0.0.0.0'),
  PUBLIC_WEB_URL: z.string().url().default('https://pondokmultimedia.id'),
  DASHBOARD_URL: z.string().url().default('https://app.pondokmultimedia.id'),
  CORS_ORIGINS: z.string().default(''),
  INITIAL_AI_CREDITS: z.coerce.number().int().min(0).default(100),
  INITIAL_HERMES_SLOTS: z.coerce.number().int().min(0).default(1),
  INITIAL_STORAGE_QUOTA_BYTES: z.coerce.number().int().min(0).default(1073741824),
  NINE_ROUTER_URL: z.string().url().default('http://127.0.0.1:20128'),
  NINE_ROUTER_API_KEY: optionalString(),
  AI_REQUEST_RESERVE_CREDITS: z.coerce.number().int().positive().default(5),
  AI_TOKENS_PER_CREDIT: z.coerce.number().int().positive().default(1000),
  HERMES_WORKSPACE_ROOT: z.string().min(1).default('/srv/pmmi/workspaces'),
  TELEGRAM_BOT_USERNAME: optionalString(),
  TELEGRAM_WEBHOOK_SECRET: optionalString(),
  RESEND_WEBHOOK_SECRET: optionalString(),
  OPS_TOKEN: optionalString(z.string().min(16)),
});

export const config = schema.parse(process.env);
