import type { FastifyRequest, FastifyReply } from "fastify";
import { asyncHandle, successHandle, errorHandle } from "../utils/handler.js";
import { CreateGig, GetGigs, GetGigById, GetGigsByCompanyId, GetGigsByLocation } from "../services/gigs.service.js";
import type { Gigs } from "../types/gigs.type.js";
import axios from "axios";


export const createGig = asyncHandle(async (request: FastifyRequest, reply: FastifyReply) => {
    const { title, description, price, latitude, longitude, target }: Gigs = request.body as Gigs;
    const companyId = request.company?.id; // Assuming companyId is available in the request context

    if (!title || !description || !companyId || !price) {
        return errorHandle('All fields are required', reply, 400);
    }

    const data: Gigs = { title, description, price, latitude, longitude, companyId, target };

    const location = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${latitude},${longitude}`);



    const gig = await CreateGig(data, location.data[0]?.display_name || null);

    if (typeof gig === 'string') {
        return errorHandle(gig, reply, 500);
    } else {
        successHandle(gig, reply, 201);
    }
});

export const getGigs = asyncHandle(async (request: FastifyRequest, reply: FastifyReply) => {
    const page = parseInt((request.query as any).page as string) || 1;
    const latitudeRaw = (request.query as any).latitude;
    const longitudeRaw = (request.query as any).longitude;

    // Only parse if present and not undefined/null/empty
    const latitude = latitudeRaw !== undefined && latitudeRaw !== null && latitudeRaw !== ''
        ? parseFloat(latitudeRaw as string)
        : undefined;
    const longitude = longitudeRaw !== undefined && longitudeRaw !== null && longitudeRaw !== ''
        ? parseFloat(longitudeRaw as string)
        : undefined;

    console.log('Page:', page, 'Latitude:', latitude, 'Longitude:', longitude);

    if (page < 1) {
        return errorHandle('Page number must be greater than 0', reply, 400);
    }

    // Only fetch by location if both latitude and longitude are valid numbers
    if (typeof latitude === 'number' && !isNaN(latitude) && typeof longitude === 'number' && !isNaN(longitude)) {
        console.log('Fetching gigs by location:', latitude, longitude);
        const Gigs = await GetGigsByLocation(latitude, longitude, page);
        if (typeof Gigs === 'string') {
            return errorHandle(Gigs, reply, 500);
        }
        if (Gigs.gigs.length === 0) {
            return errorHandle('No gigs found for the specified location', reply, 404);
        }
        successHandle(Gigs, reply, 200);
        return;
    }

    // Fallback: fetch all gigs for the page
    const gigs = await GetGigs(page);

    if (typeof gigs === 'string') {
        return errorHandle(gigs, reply, 500);
    } else {
        successHandle(gigs, reply, 200);
    }
});

export const getGigById = asyncHandle(async (request: FastifyRequest, reply: FastifyReply) => {
    
    const company = (request.query as any).company as string;
    const gigId = (request.params as any).id as string;

    console.log('Company:', company, 'Gig ID:', gigId);
    

    const gig = await GetGigById(gigId);
    if (typeof gig === 'string') {
        return errorHandle(gig, reply, 500);
    } else if (!gig) {
        return errorHandle('Gig not found', reply, 404);
    } else {
        if (company) {
            const companyId = request.company?.id;
            if (companyId!=gig.company.id) {
                return errorHandle('Unauthorized access to this gig', reply, 403);
            }
        }

        successHandle(gig, reply, 200);
    }
});

export const getGigsByCompanyId = asyncHandle(async (request: FastifyRequest, reply: FastifyReply) => {
    const companyId = request.company?.id;
    const page = parseInt((request.query as any).page as string) || 1;

    if (!companyId) {
        return errorHandle('Company ID is required', reply, 400);
    }

    if (page < 1) {
        return errorHandle('Page number must be greater than 0', reply, 400);
    }

    const gigs = await GetGigsByCompanyId(companyId, page);

    if (typeof gigs === 'string') {
        return errorHandle(gigs, reply, 500);
    } else {
        successHandle(gigs, reply, 200);
    }
});