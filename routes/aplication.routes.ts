import type { FastifyInstance } from "fastify";
import { repAuthChecker } from "../utils/repAuth.js";
import { companyAuthChecker } from "../utils/companyAuth.js";
import { createApplicationHandler, updateApplicationStatusHandler, getApplicationsByGigIdHandler, getApplicationsByRepIdHandler, getApplicationByGigIdAndRepIDHandler, getAcceptedApplicationsByRepIdHandler, getApplicationsByCompanyIdHandler } from "../controllers/application.controller.js";

export const applicationRoutes = async (fastify: FastifyInstance) => {
    fastify.post('/application', { preHandler: repAuthChecker }, createApplicationHandler);
    fastify.get('/application/:gigId', { preHandler: repAuthChecker }, getApplicationByGigIdAndRepIDHandler);
    fastify.put('/application/update', { preHandler: companyAuthChecker }, updateApplicationStatusHandler);
    fastify.get('/company/application', { preHandler: companyAuthChecker }, getApplicationsByCompanyIdHandler);
    fastify.get('/company/application/gig/:id', { preHandler: companyAuthChecker }, getApplicationsByGigIdHandler);
    fastify.get('/rep/application', { preHandler: repAuthChecker }, getApplicationsByRepIdHandler);
    fastify.get('/rep/application/accepted', { preHandler: repAuthChecker }, getAcceptedApplicationsByRepIdHandler);
};