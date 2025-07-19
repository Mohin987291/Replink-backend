import { PrismaClient } from "../generated/prisma/index.js";
import type { Reps } from "../types/reps.types.js";

const prisma = new PrismaClient();

export const createRep = async (data: Reps): Promise<Reps | string> => {
    try {
        const rep = await prisma.reps.create({
            data: {
                name: data.name,
                email: data.email,
                password: data.password, 
            }
        });
        return rep;
    } catch (error) {
        console.error("Error creating Rep:", error);
        return "Failed to create Rep";
    }
};

export const getRepByEmail = async (email: string) => {
    try {
        const rep = await prisma.reps.findUnique({
            where: { email },
        });
        return rep;
    } catch (error) {
        console.error("Error fetching Rep by email:", error);
        return 'Failed to fetch Rep';
    }
};

export const passRep = async (id: string) => {
    try {
        const updatedRep = await prisma.reps.update({
            where: { id },
            data:{
                isPassed: true
            },
        });
        return updatedRep;
    } catch (error) {
        console.error("Error updating Rep:", error);
        return "Failed to pass Rep";
    }
}

export const getMe = async (id: string) => {
    try {
        const rep = await prisma.reps.findUnique({
            where: { id },
        });
        return rep;
    } catch (error) {
        console.error("Error fetching Rep by id:", error);
        return 'Failed to fetch Rep';
    }
}

export const updateRepProfile = async (id: string, data: any) => {
    try {
        const updatedRep = await prisma.reps.update({
            where: { id },
            data,
        });
        return {
            rep:{
                name: updatedRep.name,
                email: updatedRep.email,
                isPassed: updatedRep.isPassed,
                profilePic: updatedRep.profilePic,
                phoneNo: updatedRep.phoneNo,
                rating: updatedRep.rating,
                bio: updatedRep.bio,
                isVerified: updatedRep.isVerified
            }
        };
    } catch (error) {
        console.error("Error updating Rep profile:", error);
        return "Failed to update Rep profile";
    }
}

export const getRatingsByRepId = async (id: string) => {
    try {
        const ratings = await prisma.reps.findUnique({
            where: { id },
            select: {
                rating: true,
                ratingCount: true,
            }
        });
        return ratings;
    } catch (error) {
        console.error("Error fetching Rep ratings:", error);
        return 'Failed to fetch Rep ratings';
    }
}

export const updateRating = async (id: string, data: any) => {
    try {
        const updatedRep = await prisma.reps.update({
            where: { id },
            data,
        });
        return {
            rating: updatedRep.rating,
            ratingCount: updatedRep.ratingCount,
        };
    } catch (error) {
        console.error("Error updating Rep rating:", error);
        return "Failed to update Rep rating";
    }
}