import { PrismaClient } from "../generated/prisma/index.js";
import type { Gigs } from "../types/gigs.type.js";

const prisma = new PrismaClient();

export const CreateGig = async (data:Gigs, location: string):Promise<Gigs|string> => {
    try {
        const gig = await prisma.gigs.create({
            data: {
                title: data.title,
                description: data.description,
                price: data.price,
                latitude: data.latitude,
                longitude: data.longitude,
                Location: location,
                companyId: data.companyId,
                target: data.target,
            }
        });
        return gig;
    } catch (error: unknown) {
        console.error('Error creating gig:', error);
        return "Error creating gig";
    }
};

export const GetGigs = async (page:number) => {
    try {
        const count = await prisma.gigs.count({
            where: {
                status: "ACTIVE"
            }
        });
        const gigs = await prisma.gigs.findMany({
            where: {
                status: "ACTIVE"
            },
            select:{
                id: true,
                title: true,
                description: true,
                price: true,
                Location: true,
                createdAt: true,
                status: true,
                target: true,
                company:{
                    select: {
                        id: true,
                        name: true,
                    }
                }
            },
            skip: (page - 1) * 10,
            take: 10,
            orderBy: {
                createdAt: 'desc'
            }
        });
        return {
            gigs,
            total: count,
            page,
            totalPages: Math.ceil(count / 10)
        };
    } catch (error: unknown) {
        console.error('Error fetching gigs:', error);
        return "Error fetching gigs";
    }
}

export const GetGigsByLocation = async (lat: number, lng: number, page: number) => {
    try {
        const count = await prisma.gigs.count({
            where: {
                status: "ACTIVE",
                latitude: {
                    gte: lat - 0.1,
                    lte: lat + 0.1
                },
                longitude: {
                    gte: lng - 0.1,
                    lte: lng + 0.1
                }
            }
        });
        const gigs = await prisma.gigs.findMany({
            where: {
                status: "ACTIVE",
                latitude: {
                    gte: lat - 0.1,
                    lte: lat + 0.1
                },
                longitude: {
                    gte: lng - 0.1,
                    lte: lng + 0.1
                }
            },
            select:{
                id: true,
                title: true,
                description: true,
                price: true,
                Location: true,
                createdAt: true,
                status: true,
                company:{
                    select: {
                        id: true,
                        name: true,
                    }
                }
            },
            skip: (page - 1) * 10,
            take: 10,
            orderBy: {
                createdAt: 'desc'
            }
        });
        return {
            gigs,
            total: count,
            page,
            totalPages: Math.ceil(count / 10)
        };
    } catch (error) {
        console.error('Error fetching gigs by location:', error);
        return "Error fetching gigs by location";
    }
}

export const GetGigById = async (id: string) => {
    try {
        const gig = await prisma.gigs.findUnique({
            where: { id },
            select: {
                id: true,
                title: true,
                description: true,
                price: true,
                latitude: true,
                longitude: true,
                Location: true,
                target: true,
                createdAt: true,
                updatedAt: true,
                status: true,
                company: {
                    select: {
                        id: true,
                        name: true,
                    }
                },
                _count:{
                    select:{
                        Reports:true
                    }
                }
            }
        });
        return gig;
    } catch (error: unknown) {
        console.error('Error fetching gig by ID:', error);
        return "Error fetching gig by ID";
    }
};


export const GetGigsByCompanyId = async (companyId: string, page: number) => {
    try {
        const count = await prisma.gigs.count({
            where: {
                companyId,
            }
        });
        const gigs = await prisma.gigs.findMany({
            where: {
                companyId,
            },
            select: {
                id: true,
                title: true,
                description: true,
                price: true,
                latitude: true,
                longitude: true,
                Location: true,
                createdAt: true,
                updatedAt: true,
                status: true,
                target:true,
                _count:{
                    select:{
                        Applications:true
                    }
                }
            },
            skip: (page - 1) * 10,
            take: 10,
            orderBy: {
                createdAt: 'desc'
            }
        });
        return {
            gigs,
            total: count,
            page,
            totalPages: Math.ceil(count / 10)
        };
    } catch (error: unknown) {
        console.error('Error fetching gigs by company ID:', error);
        return "Error fetching gigs by company ID";
    }
}

