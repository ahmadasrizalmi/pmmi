import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { pool } from '../db.js';
import { requireAuth } from '../security/authz.js';

const programSchema=z.object({code:z.string().min(2).max(40).regex(/^[A-Z0-9_]+$/),name:z.string().min(2),description:z.string().max(3000).optional(),isActive:z.boolean().default(true)});
const cohortSchema=z.object({name:z.string().min(2),year:z.number().int().min(2020).max(2100),startsAt:z.string().date().optional(),endsAt:z.string().date().optional(),isActive:z.boolean().default(true)});

export async function registerCatalogRoutes(app:FastifyInstance){
  app.get('/v1/catalog/programs',async()=>({items:(await pool.query(`select * from programs where is_active=true order by name`)).rows}));
  app.get('/v1/catalog/cohorts',async()=>({items:(await pool.query(`select * from cohorts where is_active=true order by year desc,name`)).rows}));

  app.post('/v1/catalog/programs',async(request,reply)=>{
    const session=await requireAuth(request,reply,['ADMIN']);if(!session)return;
    const parsed=programSchema.safeParse(request.body);if(!parsed.success)return reply.code(400).send({error:'invalid program',issues:parsed.error.flatten()});const d=parsed.data;
    const result=await pool.query(`insert into programs(code,name,description,is_active) values($1,$2,$3,$4) on conflict(code) do update set name=excluded.name,description=excluded.description,is_active=excluded.is_active returning *`,[d.code,d.name,d.description??null,d.isActive]);
    return reply.code(201).send(result.rows[0]);
  });

  app.post('/v1/catalog/cohorts',async(request,reply)=>{
    const session=await requireAuth(request,reply,['ADMIN']);if(!session)return;
    const parsed=cohortSchema.safeParse(request.body);if(!parsed.success)return reply.code(400).send({error:'invalid cohort',issues:parsed.error.flatten()});const d=parsed.data;
    const result=await pool.query(`insert into cohorts(name,year,starts_at,ends_at,is_active) values($1,$2,$3,$4,$5) on conflict(name,year) do update set starts_at=excluded.starts_at,ends_at=excluded.ends_at,is_active=excluded.is_active returning *`,[d.name,d.year,d.startsAt??null,d.endsAt??null,d.isActive]);
    return reply.code(201).send(result.rows[0]);
  });
}
