import type { FastifyRequest, FastifyReply } from "fastify";
import { asyncHandle, successHandle, errorHandle } from "../utils/handler.js";
import { createCompany, getCompanyByEmail, getStats } from "../services/companies.service.js";
import { generToken } from "../utils/generateToken.js";
import bcryptjs from "bcryptjs";

import type { Company } from "../types/company.type.js";

export const registerCompany = asyncHandle(async (request: FastifyRequest, reply: FastifyReply) => {
    const { name, email, password }: Company = request.body as Company;

    if (!name || !email || !password) {
        return errorHandle('All fields are required', reply, 400);
    };

    const [existingCompany,hashedPassword] = await Promise.all([
        getCompanyByEmail(email),
        bcryptjs.hash(password, 10)
    ])
    
    if (existingCompany) {
        return errorHandle('Company with this email already exists', reply, 409);
    }

    const data: Company = { name, email, password: hashedPassword };

    const company = await createCompany(data);

    if (typeof company === 'string') {
        return errorHandle(company, reply, 500);
    } else {
        if (!company.id) {
            return errorHandle('Company creation failed', reply, 500);
        }
        const token = generToken(company.id);
        successHandle({
            token,
            company: {
                id: company.id,
                name: company.name,
                email: company.email
            }
        }, reply, 201);
    }
});


export const CompanyLogin = asyncHandle(async (request: FastifyRequest, reply: FastifyReply) => {
    const { email, password }: { email: string; password: string } = request.body as { email: string; password: string };

    if (!email || !password) {
        return errorHandle('Email and password are required', reply, 400);
    }

    const company = await getCompanyByEmail(email);
    if (typeof company === 'string') {
        return errorHandle(company, reply, 500);
    }
    if (!company) {
        return errorHandle('Company not found', reply, 404);
    }
    const isPasswordValid = await bcryptjs.compare(password, company.password);
    if (!isPasswordValid) {
        return errorHandle('Invalid password', reply, 401);
    }

    const token = generToken(company.id);
    successHandle({
        token,
        company: {
            id: company.id,
            name: company.name,
            email: company.email
        }
    }, reply, 200);
});

export const getCompanyStats = asyncHandle(async (request: FastifyRequest, reply: FastifyReply) => {
    const companyId = request.company?.id;

    if (!companyId) {
        return errorHandle('Company ID is required', reply, 400);
    }

    const stats = await getStats(companyId);

    

    if (typeof stats === 'string') {
        return errorHandle(stats, reply, 500);
    } else if (!stats) {
        return errorHandle('Failed to fetch stats', reply, 404);
    } 
     else {
        successHandle(stats, reply, 200);
    }
});