import { PrismaClient } from "../generated/prisma/index.js";
import type { Application } from "../types/application.types.js";
import { AppStatus } from "../generated/prisma/index.js";

const prisma = new PrismaClient();

export const CreateApplication = async (data: Application) => {
    try {
        const application = await prisma.applications.create({
            data: {
                gigId: data.gigId,
                repId: data.repId,
            }
        });
        return application;
    } catch (error: unknown) {
        console.error('Error creating application:', error);
        return "Error creating application";
    }
};

export const getApplicationByRepIdAndGigId = async (repId: string, gigId: string) => {
    try {
        const application = await prisma.applications.findFirst({
            where: {
                repId,
                gigId
            }
        });
        return application;
    } catch (error: unknown) {
        console.error('Error fetching application:', error);
        return "Error fetching application";
    }
}
export const getApplicationsByRepId = async (repId: string) => {
    try {
        const applications = await prisma.applications.findMany({
            where: {
                repId
            },
            include: {
                gig: true
            }
        });
        return applications;
    } catch (error: unknown) {
        console.error('Error fetching applications:', error);
        return "Error fetching applications";
    }
}

export const updateApplicationStatus = async (id: string, status: string) => {

    console.log('Updating application status:', { id, status });
    try {
        const update = await prisma.$transaction(async (tx) => {
            const application = await tx.applications.update({
                where: { id },
                data: { status: status as AppStatus }
            });
            if (status === AppStatus.ACCEPTED) {
                await tx.gigs.update({
                    where: { id: application.gigId },
                    data: { status: 'INACTIVE' }
                });
            }
            return application;
        });
        console.log('Application status updated successfully:', update);
        return update;
    } catch (error: unknown) {
        console.error('Error updating application status:', error);
        return "Error updating application status";
    }
}

export const getApplicationsByGigId = async (gigId: string, page: number) => {
    try {
        const count = await prisma.applications.count({
            where: { gigId },
        });
        const applications = await prisma.applications.findMany({
            where: { gigId },
            skip: (page - 1) * 10,
            take: 10,
            orderBy: [
                {
                    status: 'asc'
                },
                {
                    createdAt: 'desc'
                }
            ],
            include: {
                rep: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });
        return {
            applications,
            total: count,
            page,
            totalPages: Math.ceil(count / 10),
            limit: 10
        };
    } catch (error: unknown) {
        console.error('Error fetching applications by gig ID:', error);
        return "Error fetching applications by gig ID";
    }
};

export const getApplicationByGigIdAndRepID = async (gigId: string, repId: string) => {
    try {
        const application = await prisma.applications.findFirst({
            where: {
                gigId,
                repId
            }
        });
        return application;
    } catch (error: unknown) {
        console.error('Error fetching application by gig ID and rep ID:', error);
        return "Error fetching application by gig ID and rep ID";
    }
}

export const getAcceptedApplicationsByRepId = async (repId: string) => {
    try {
        const applications = await prisma.applications.findMany({
            where: {
                repId,
                status: AppStatus.ACCEPTED
            },
            include: {
                gig: true
            }
        });
        return applications;
    } catch (error: unknown) {
        console.error('Error fetching applications:', error);
        return "Error fetching applications";
    }
}

export const getApplicationsByCompanyId = async (companyId: string, pageNumber: number) => {
    try {
        const count = await prisma.applications.count({
            where: {
                gig: {
                    companyId
                }
            }
        });
        const applications = await prisma.applications.findMany({
            where: {
                gig: {
                    companyId
                }
            },
            include: {
                gig: true,
                rep: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            },
            take: 10,
            skip: (pageNumber - 1) * 10,
            orderBy: {
                createdAt: 'desc'
            },
        });
        return {
            applications,
            total: count,
            page: pageNumber,
            totalPages: Math.ceil(count / 10),
            limit: 10
        };
    } catch (error: unknown) {
        console.error('Error fetching applications by company ID:', error);
        return "Error fetching applications by company ID";
    }
}