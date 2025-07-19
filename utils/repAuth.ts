import jwt from 'jsonwebtoken';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { errorHandle } from './handler.js';
import { PrismaClient } from '../generated/prisma/index.js';
const prisma = new PrismaClient();

declare module 'fastify' {
  interface FastifyRequest {
    Rep?: {
      id: string;
      name: string;
      email: string;
    };
  }
}

export const repAuthChecker = async (request: FastifyRequest, reply: FastifyReply) => {
    console.log('Checking Rep authentication...');
    const token = request.headers.authorization?.split(' ')[1];
    console.log('Token:', token);

    if (!token) return errorHandle('Unauthorized: No token provided',reply, 401, );
    
    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
        console.log('Decoded token:', decoded);
        if(typeof decoded === 'string' || !decoded?.userId) {
            return errorHandle('Unauthorized: Invalid token', reply, 401);
        }else {
            const user = await prisma.reps.findUnique({
                where: { id: decoded.userId },
                select: { id: true, name: true, email: true }
            });

            if (!user) {
                return errorHandle('Unauthorized: User not found', reply, 401);
            }

            request.Rep = user; // Attach user to request object
            return;
        }
    }catch (error) {
        return errorHandle('Unauthorized: Invalid token', reply, 401);
    }
}