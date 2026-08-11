import { z } from 'zod';

const emptyToUndefined=(value:unknown)=>typeof value==='string'&&value.trim()===''?undefined:value;
const optionalString=(schema:z.ZodTypeAny=z.string())=>z.preprocess(emptyToUndefined,schema.optional());
const bool=z.preprocess(v=>typeof v==='string'?['1','true','yes','on'].includes(v.toLowerCase()):v,z.boolean());
const csvNumbers=(fallback:string)=>z.string().default(fallback).transform(v=>v.split(',').map(x=>Number(x.trim())).filter(Number.isFinite));

const schema=z.object({
  DATABASE_URL:z.string().min(1),
  WORKER_INTERVAL_MS:z.coerce.number().int().min(250).default(3000),
  WORKER_BATCH_SIZE:z.coerce.number().int().min(1).max(100).default(20),
  NOTIFICATION_TRANSPORT:z.enum(['live','mock']).default('live'),
  RESEND_API_KEY:optionalString(),
  EMAIL_FROM:z.string().default('PMMI <noreply@pondokmultimedia.id>'),
  TELEGRAM_BOT_TOKEN:optionalString(),
  WHATSAPP_PROVIDER:z.enum(['disabled','baileys','meta']).default('disabled'),
  BAILEYS_GATEWAY_URL:optionalString(z.string().url()),
  BAILEYS_SERVICE_TOKEN:optionalString(z.string().min(24)),
  META_WHATSAPP_URL:optionalString(z.string().url()),
  META_WHATSAPP_TOKEN:optionalString(),
  HERMES_ENABLED:bool.default(false),
  HERMES_BIN:z.string().default('hermes'),
  HERMES_TEMPLATE_PROFILE:optionalString(),
  HERMES_START_GATEWAY:bool.default(false),
  MAX_DELIVERY_ATTEMPTS:z.coerce.number().int().min(1).max(20).default(5),
  ASSIGNMENT_REMINDER_HOURS:csvNumbers('72,24,3'),
  CLASS_REMINDER_MINUTES:z.coerce.number().int().min(5).max(1440).default(60),
  AI_CREDIT_THRESHOLDS:csvNumbers('50,20,5,0'),
});

export const workerConfig=schema.parse(process.env);
