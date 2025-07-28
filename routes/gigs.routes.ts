import type { FastifyInstance } from "fastify";
import { createGig, getGigs, getGigById, getGigsByCompanyId } from "../controllers/gigs.controller.js";
import { companyAuthChecker } from "../utils/companyAuth.js";
import { repAuthChecker } from "../utils/repAuth.js";

export const gigsRoutes = async (fastify: FastifyInstance): Promise<void> => {
  // Declare a route for creating a gig
  fastify.post('/gigs', {preHandler:companyAuthChecker} ,createGig);
  fastify.get('/gigs',{preHandler:repAuthChecker} ,getGigs);
  fastify.get('/gigs/:id' ,getGigById);
  fastify.get('/company/gigs/:id', {preHandler:companyAuthChecker} ,getGigById);
  fastify.get('/company/gigs', {preHandler:companyAuthChecker} , getGigsByCompanyId);
};