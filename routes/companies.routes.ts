import type{ FastifyInstance } from "fastify";
import { registerCompany, CompanyLogin, getCompanyStats } from "../controllers/companies.controller.js";
import { companyAuthChecker } from "../utils/companyAuth.js";

export const companiesRoutes = async (fastify: FastifyInstance): Promise<void> => {
  // Declare a route for the root path
  fastify.post('/companies/register', registerCompany);
  fastify.post('/companies/login', CompanyLogin);
  fastify.get('/company/stats', {preHandler: companyAuthChecker} ,getCompanyStats);
};