import type { FastifyInstance } from "fastify";
import { getReportsByGigIdHandler, createReportHandler, getReportByCompanyIdHandler } from "../controllers/report.controller.js";
import { companyAuthChecker } from "../utils/companyAuth.js";
import { repAuthChecker } from "../utils/repAuth.js";

export const reportRoutes = async (fastify: FastifyInstance) => {
  fastify.post("/gigs/reports", { preHandler: repAuthChecker }, createReportHandler);
  fastify.get("/company/reports", { preHandler: companyAuthChecker }, getReportByCompanyIdHandler);
  fastify.get("/gigs/:gigId/reports",{preHandler: companyAuthChecker},getReportsByGigIdHandler);
  fastify.get("/rep/gigs/:gigId/reports", { preHandler: repAuthChecker }, getReportsByGigIdHandler);
}