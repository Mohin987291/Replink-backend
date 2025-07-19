import jwt from 'jsonwebtoken';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { errorHandle } from './handler.js';
import { PrismaClient } from '../generated/prisma/index.js';
const prisma = new PrismaClient();

declare module 'fastify' {
  interface FastifyRequest {
    company?: {
      id: string;
      name: string;
      email: string;
    };
  }
}

export const companyAuthChecker = async (request: FastifyRequest, reply: FastifyReply) => {
    const token = request.headers.authorization?.split(' ')[1];

    if (!token) return errorHandle('Unauthorized: No token provided',reply, 401, );

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
        if(typeof decoded === 'string' || !decoded?.userId) {
            console.log('Invalid token:', decoded);
            return errorHandle('Unauthorized: Invalid token', reply, 401);
        }else {
            const user = await prisma.companies.findUnique({
                where: { id: decoded.userId },
                select: { id: true, name: true, email: true } // Adjust fields as needed
            });

            if (!user) {
                console.log('User not found:', decoded.userId); 
                return errorHandle('Unauthorized: User not found', reply, 401);
            }

            request.company = user; // Attach user to request object
            return;
        }
    }catch (error) {
        console.error('Token verification error:', error);
        return errorHandle('Unauthorized: Invalid token', reply, 401);
    }
}