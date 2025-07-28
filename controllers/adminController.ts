import type { FastifyRequest, FastifyReply } from 'fastify';
import { asyncHandle, errorHandle, successHandle } from '../utils/handler.js';
import { sendEmail } from '../utils/mail.js';
import { createAdmin, getAdminByEmail, getSuspeciousActivity } from '../services/admin.service.js';
import bcryptjs from 'bcryptjs';
import { generToken } from '../utils/generateToken.js';

export const createAdminHandler = asyncHandle(async (request: FastifyRequest, reply: FastifyReply) => {
    const { email, name } = request.body as { email: string; name: string };

    // Generate password based on name with one special character and 4 digit number
    const specialChars = ['!', '@', '#', '$', '%', '&', '*'];
    const randomSpecialChar = specialChars[Math.floor(Math.random() * specialChars.length)];
    const fourDigitNumber = Math.floor(1000 + Math.random() * 9000); // Ensures 4 digits
    const generatedPassword = `${name.replace(/\s+/g, '')}${randomSpecialChar}${fourDigitNumber}`;
    
    // Hash the password
    const hashedPassword = await bcryptjs.hash(generatedPassword, 10);
    
    // Create admin with hashed password
    const admin = await createAdmin(email, hashedPassword, name);
    if (typeof admin === 'string') {
        return errorHandle(admin, reply, 400);
    }
    
    // Send email with the unhashed password
    const emailHtml = `
        <h1>Welcome to Replink Admin Panel</h1>
        <p>Hello ${name},</p>
        <p>Your account has been created successfully. You can now use the platform to manage your Replink account.</p>
        <p>Your login credentials:</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Password:</strong> ${generatedPassword}</p>`;
    
    await sendEmail(email, 'Welcome to Replink Admin Panel', emailHtml);
    return successHandle(admin, reply, 201);
});

export const LoginAdminHandler = asyncHandle(async (request: FastifyRequest, reply: FastifyReply) => {
    const { email, password } = request.body as { email: string; password: string };
    const admin = await getAdminByEmail(email);
    if (typeof admin === 'string') {
        return errorHandle(admin, reply, 400);
    }
    if (!admin) {
        return errorHandle('Admin not found', reply, 400);
    }
    const isPasswordValid = await bcryptjs.compare(password, admin.password);
    if (!isPasswordValid) {
        return errorHandle('Invalid password', reply, 400);
    }
    const token = generToken(admin.id);
    return successHandle({ admin: { id: admin.id, email: admin.email, name: admin.name }, token }, reply, 200);
});


export const getSuspeciousActivityHandler = asyncHandle(async (request: FastifyRequest, reply: FastifyReply) => {
    const { page } = request.query as { page: number };
    const activity = await getSuspeciousActivity(page);
    if (typeof activity === 'string') {
        return errorHandle(activity, reply, 400);
    }
    return successHandle(activity, reply, 200);
});