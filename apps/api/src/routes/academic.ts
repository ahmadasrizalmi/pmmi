import { FastifyInstance } from 'fastify';

const notFound = (name: string) => ({ error: `${name} not found` });

export async function registerAcademicRoutes(app: FastifyInstance) {
  app.get('/v1/academic/classes', async () => ({ items: [], note: 'DB wiring follows repository layer in Phase 2 hardening.' }));

  app.post('/v1/academic/assignments', async (request, reply) => {
    const body = request.body as Record<string, unknown> | undefined;
    if (!body?.classId || !body?.title) return reply.code(400).send({ error: 'classId and title are required' });
    return reply.code(201).send({ status: 'accepted', assignment: body });
  });

  app.post('/v1/academic/assignments/:assignmentId/submissions', async (request, reply) => {
    const { assignmentId } = request.params as { assignmentId: string };
    if (!assignmentId) return reply.code(404).send(notFound('assignment'));
    return reply.code(201).send({ status: 'submitted', assignmentId });
  });

  app.post('/v1/academic/submissions/:submissionId/grade', async (request, reply) => {
    const { submissionId } = request.params as { submissionId: string };
    const body = request.body as { score?: number; feedback?: string; revisionRequired?: boolean; revisionDueAt?: string } | undefined;
    if (typeof body?.score !== 'number') return reply.code(400).send({ error: 'score is required' });
    return {
      status: body.revisionRequired ? 'revision_requested' : 'graded',
      submissionId,
      score: body.score,
      feedback: body.feedback ?? null,
      revisionDueAt: body.revisionDueAt ?? null,
    };
  });

  app.post('/v1/academic/submissions/:submissionId/feature', async (request, reply) => {
    const { submissionId } = request.params as { submissionId: string };
    const body = request.body as { title?: string; slug?: string; summary?: string } | undefined;
    if (!body?.title || !body?.slug) return reply.code(400).send({ error: 'title and slug are required' });
    return reply.code(201).send({
      submissionId,
      featured: true,
      published: true,
      requiresStudentApproval: false,
      ...body,
    });
  });
}
