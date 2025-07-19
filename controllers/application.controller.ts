import type { FastifyRequest, FastifyReply } from "fastify";
import { asyncHandle, successHandle, errorHandle } from "../utils/handler.js";
import type { Application } from "../types/application.types.js";
import { CreateApplication, getApplicationByRepIdAndGigId, getApplicationsByRepId, updateApplicationStatus, getApplicationsByGigId, getApplicationByGigIdAndRepID, getAcceptedApplicationsByRepId, getApplicationsByCompanyId } from "../services/application.service.js";

export const createApplicationHandler = asyncHandle(async (request: FastifyRequest, reply: FastifyReply) => {
    const data: Partial <Application> = request.body as Partial <Application>;
    const RepId = request.Rep?.id;

    if (!data.gigId || !RepId) {
        return errorHandle('Gig ID and Rep ID are required', reply, 400);
    }

    const existingApplication = await getApplicationByRepIdAndGigId(RepId, data.gigId);
    if (existingApplication) {
        return errorHandle('Application already exists for this Rep and Gig', reply, 409);
    }

    const Data: Application = {
        gigId: data.gigId,
        repId: RepId,
    };

    const application = await CreateApplication(Data);

    if (typeof application === 'string') {
        return errorHandle(application, reply, 500);
    } else {
        successHandle(application, reply, 201);
    }
});

export const updateApplicationStatusHandler = asyncHandle(async (request: FastifyRequest, reply: FastifyReply) => {
    console.log('Update Application Status Handler Called');
    const CompanyId = request.company?.id;
    const { id, status, companyId } = request.body as { id: string; status: string; companyId: string };

    console.log('CompanyId:', CompanyId, 'Status:', status, 'CompanyId from body:', companyId);

    if (CompanyId !== companyId){
        return errorHandle('Unauthorized to update this application', reply, 403);
    }

    if (!id || !status) {
        return errorHandle('Application ID, status, and Rep ID are required', reply, 400);
    }

    const application = await updateApplicationStatus(id, status);

    if (typeof application === 'string') {
        return errorHandle(application, reply, 500);
    } else {
        console.log('Application updated successfully:', application);
        successHandle(application, reply, 200);
    }
});

export const getApplicationsByRepIdHandler = asyncHandle(async (request: FastifyRequest, reply: FastifyReply) => {
    const RepId = request.Rep?.id;

    if (!RepId) {
        return errorHandle('Rep ID is required', reply, 400);
    }

    const applications = await getApplicationsByRepId(RepId);

    if (typeof applications === 'string') {
        return errorHandle(applications, reply, 500);
    } else {
        successHandle(applications, reply, 200);
    }
});

export const getApplicationsByGigIdHandler = asyncHandle(async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const page = parseInt((request.query as any).page as string) || 1;

    if (!id) {
        return errorHandle('Gig ID is required', reply, 400);
    }

    const applications = await getApplicationsByGigId(id, page);

    if (typeof applications === 'string') {
        return errorHandle(applications, reply, 500);
    } else {
        successHandle(applications, reply, 200);
    }
});

export const getApplicationByGigIdAndRepIDHandler = asyncHandle(async (request: FastifyRequest, reply: FastifyReply) => {
    console.log('Get Application by Gig ID and Rep ID Handler Called');
    const { gigId } = request.params as { gigId: string;};
    const repId = request.Rep?.id;

    console.log('Gig ID:', gigId, 'Rep ID:', repId);

    if (!gigId || !repId) {
        return errorHandle('Gig ID and Rep ID are required', reply, 400);
    }

    const application = await getApplicationByGigIdAndRepID(gigId, repId);

    if (typeof application === 'string') {
        return errorHandle(application, reply, 500);
    } else {
        successHandle(application, reply, 200);
    }
});

export const getAcceptedApplicationsByRepIdHandler = asyncHandle(async (request: FastifyRequest, reply: FastifyReply) => {
    const RepId = request.Rep?.id;

    if (!RepId) {
        return errorHandle('Rep ID is required', reply, 400);
    }

    const applications = await getAcceptedApplicationsByRepId(RepId);

    if (typeof applications === 'string') {
        return errorHandle(applications, reply, 500);
    } else {
        successHandle(applications, reply, 200);
    }
});

export const getApplicationsByCompanyIdHandler = asyncHandle(async (request: FastifyRequest, reply: FastifyReply) => {
    const companyId = request.company?.id;
    const { page } = request.query as { page?: string };
    const pageNumber = parseInt(page ?? "1");

    if (!companyId) {
        return errorHandle('Company ID is required', reply, 400);
    }

    const applications = await getApplicationsByCompanyId(companyId, pageNumber);

    if (typeof applications === 'string') {
        return errorHandle(applications, reply, 500);
    } else {
        successHandle(applications, reply, 200);
    }
});