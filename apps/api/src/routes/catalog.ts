import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { pool } from '../db.js';
import { requireAuth } from '../security/authz.js';

const programSchema=z.object({code:z.string().min(2).max(40).transform(v=>v.toUpperCase()),name:z.string().min(2).max(120),description:z.string().max(4000).optional(),isActive:z.boolean().default(true)});
const cohortSchema=z.object({name:z.string().min(2).max(120),year:z.number().int().min(2020).max(2100),startsAt:z.string().datetime().optional(),endsAt:z.string().datetime().optional(),isActive:z.boolean().default(true)});
const scopeSchema=z.object({cohortId:z.string().uuid().nullable(),programId:z.string().uuid().nullable().optional()});

export async function registerCatalogRoutes(app:FastifyInstance){
  app.get('/v1/catalog/programs',async()=>({items:(await pool.query(`select id,code,name,description,is_active,created_at from programs where is_active=true order by name`)).rows}));
  app.get('/v1/catalog/cohorts',async()=>({items:(await pool.query(`select id,name,year,starts_at,ends_at,is_active,created_at from cohorts where is_active=true order by year desc,name`)).rows}));

  app.post('/v1/catalog/programs',async(request,reply)=>{const admin=await requireAuth(request,reply,['ADMIN']);if(!admin)return;const parsed=programSchema.safeParse(request.body);if(!parsed.success)return reply.code(400).send({error:'invalid program',issues:parsed.error.flatten()});const d=parsed.data;try{const r=await pool.query(`insert into programs(code,name,description,is_active) values($1,$2,$3,$4) returning *`,[d.code,d.name,d.description??null,d.isActive]);return reply.code(201).send(r.rows[0]);}catch(e:any){if(e?.code==='23505')return reply.code(409).send({error:'program code already exists'});throw e;}});

  app.post('/v1/catalog/cohorts',async(request,reply)=>{const admin=await requireAuth(request,reply,['ADMIN']);if(!admin)return;const parsed=cohortSchema.safeParse(request.body);if(!parsed.success)return reply.code(400).send({error:'invalid cohort',issues:parsed.error.flatten()});const d=parsed.data;const r=await pool.query(`insert into cohorts(name,year,starts_at,ends_at,is_active) values($1,$2,$3,$4,$5) returning *`,[d.name,d.year,d.startsAt??null,d.endsAt??null,d.isActive]);return reply.code(201).send(r.rows[0]);});

  app.patch('/v1/catalog/classes/:id/scope',async(request,reply)=>{const admin=await requireAuth(request,reply,['ADMIN']);if(!admin)return;const parsed=scopeSchema.safeParse(request.body);if(!parsed.success)return reply.code(400).send({error:'invalid class scope',issues:parsed.error.flatten()});const {id}=request.params as {id:string};const d=parsed.data;const r=await pool.query(`update classes set cohort_id=$1,program_id=$2 where id=$3 returning id,name,cohort_id,program_id`,[d.cohortId,d.programId??null,id]);if(!r.rowCount)return reply.code(404).send({error:'class not found'});return r.rows[0];});
}
