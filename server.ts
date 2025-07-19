import Fastify, { type FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import dotenv from 'dotenv';
import rateLimit from '@fastify/rate-limit';

import { companiesRoutes } from './routes/companies.routes.js';
import { gigsRoutes } from './routes/gigs.routes.js';
import { repsRoutes } from './routes/reps.routes.js';
import { applicationRoutes } from './routes/aplication.routes.js';
import { reportRoutes } from './routes/report.route.js';

// Load environment variables from .env file
dotenv.config();

// Create Fastify instance
const fastify: FastifyInstance = Fastify();

// Start the server
const start = async (): Promise<void> => {
  try {
    // Register CORS
    await fastify.register(cors, {
      origin: process.env.NODE_ENV === 'production' 
        ? ['https://replink-frontend.vercel.app'] 
        : ['http://localhost:3000'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    });

    // Register multipart for file uploads
    await fastify.register(multipart, {
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB per file
        files: 5, // Maximum 5 files
        fieldSize: 1024 * 1024, // 1MB for text fields
        parts: 10 // Maximum 10 parts in total
      },
      attachFieldsToBody: true, // This is important for accessing form data
      sharedSchemaId: 'MultipartFileType'
    });

    // Register rate limiting

    // Health check endpoint
    fastify.get('/health', async (request, reply) => {
      return { 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        service: 'Replink Backend'
      };
    });

    // Register routes
    fastify.register(companiesRoutes, { prefix: '/api/v1' });
    fastify.register(gigsRoutes, { prefix: '/api/v1' });
    fastify.register(repsRoutes, { prefix: '/api/v1' });
    fastify.register(applicationRoutes, { prefix: '/api/v1' });
    fastify.register(reportRoutes, { prefix: '/api/v1' });

    const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
  
    
    await fastify.listen({ port, host:'localhost' });

    console.log(`Server is running on http://0.0.0.0:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGINT', async () => {
  fastify.log.info('Received SIGINT, shutting down gracefully...');
  await fastify.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  fastify.log.info('Received SIGTERM, shutting down gracefully...');
  await fastify.close();
  process.exit(0);
});

// Start the server
start();