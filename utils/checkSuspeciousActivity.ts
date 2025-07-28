import { PrismaClient } from "../generated/prisma/index.js";
const prisma = new PrismaClient();

export const validateReportData = async (repId:string)=>{
    console.log('Triggered')
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const recentReports = await prisma.reports.findMany({
        where:{
            repId:repId,
            createdAt:{
                gte: oneHourAgo,
                lte: new Date()
            }
        }
    });

    if(recentReports.length>3){
        await prisma.suspeciousTable.create({
            data:{
                repId:repId,
                reason:`Mass Reported in 1 hour, total:${recentReports.length}`
            }
        });
    }
}