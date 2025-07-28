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
      isFraud: boolean;
    };
  }
}

export const repAuthChecker = async (request: FastifyRequest, reply: FastifyReply) => {
    const token = request.headers.authorization?.split(' ')[1];

    if (!token) return errorHandle('Unauthorized: No token provided',reply, 401, );
    
    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
        if(typeof decoded === 'string' || !decoded?.userId) {
            return errorHandle('Unauthorized: Invalid token', reply, 401);
        }else {
            const user = await prisma.reps.findUnique({
                where: { id: decoded.userId },
                select: { id: true, name: true, email: true, isFraud: true }
            });

            if (!user) {
                return errorHandle('Unauthorized: User not found', reply, 401);
            }

            if (user.isFraud) {
                return errorHandle('Unauthorized: User is fraud', reply, 401);
            }

            request.Rep = user; // Attach user to request object
            return;
        }
    }catch (error) {
        return errorHandle('Unauthorized: Invalid token', reply, 401);
    }
}