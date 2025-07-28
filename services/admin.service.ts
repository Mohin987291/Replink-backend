import { PrismaClient } from "../generated/prisma/index.js";
const prisma = new PrismaClient();

export const createAdmin = async (email: string, password: string, name: string) => {
    try {
       const admin = await prisma.admin.create({
        data: {
            email,
            password,
            name,
        }
    })
    return admin; 
    } catch (error) {
        console.log(error)
        return 'Error creating admin'
    }
}

export const getAdminByEmail = async (email: string) => {
    try {
        const admin = await prisma.admin.findUnique({
            where: {
                email,
            }
        })
        return admin;
    } catch (error) {
        console.log(error)
        return 'Error getting admin'
    }
}


export const getSuspeciousActivity = async (page:number) => {
    try {
        const total = await prisma.suspeciousTable.count();
        const activity = await prisma.suspeciousTable.findMany({
            skip: (page - 1) * 10,
            take: 10,
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                rep: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        isFraud: true,
                    }
                },
            },
        })
        return {
            total,
            totalPage: Math.ceil(total / 10),
            activity,
        };
    } catch (error) {
        console.log(error)
        return 'Error getting activity'
    }
}