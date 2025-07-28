import type { FastifyInstance } from "fastify";
import { createAdminHandler, LoginAdminHandler, getSuspeciousActivityHandler } from "../controllers/adminController.js";

export const adminRoutes = (fastify: FastifyInstance) => {
    fastify.post('/admin/create', createAdminHandler);
    fastify.post('/admin/login', LoginAdminHandler);
    fastify.get('/admin/activity', getSuspeciousActivityHandler);
}
