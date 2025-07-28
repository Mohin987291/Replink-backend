import type { FastifyInstance } from "fastify";
import { RegisterRep, RepLogin, PassRep, GetMeHandler, GetRepbyId, updateRepProfileHandler, rateRep, markRepAsFraud } from "../controllers/reps.controller.js";
import { repAuthChecker } from "../utils/repAuth.js";
import { companyAuthChecker } from "../utils/companyAuth.js";

export const repsRoutes = async (fastify: FastifyInstance): Promise<void> => {
  fastify.post('/reps/register', RegisterRep);
  fastify.post('/reps/login', RepLogin);
  fastify.post('/reps/pass', PassRep);
  fastify.get('/reps/me', {preHandler: repAuthChecker} ,GetMeHandler);
  fastify.get('/reps/:id',{ preHandler: companyAuthChecker }, GetRepbyId);
  fastify.patch('/reps/me/update', { preHandler: repAuthChecker }, updateRepProfileHandler);
  fastify.post('/reps/rate', { preHandler: companyAuthChecker }, rateRep);
  fastify.post('/reps/fraud', markRepAsFraud);
};