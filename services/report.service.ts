import { PrismaClient } from "../generated/prisma/index.js";
import type { Report } from "../types/report.types.js";

const prisma = new PrismaClient();

export const getReportsByGigId = async (gigId: string) => {
  try {
    const reports = await prisma.reports.findMany({
      where: { gigId },
      select:{
        id: true,
        gigId: true,
        repId: true,
        reason: true,
        imageUrl: true,
        latitude: true,
        longitude: true,
        location: true,
        companyId: true,
        createdAt: true,
        updatedAt: true,
        rep:{
            select: {
                id: true,
                name: true,
                email: true,
            },
        },
      }
    });
    return reports;
  } catch (error:unknown) {
    console.error("Error fetching reports:", error);
    return 'Error fetching reports';
  }
}

export const createReport = async (data: Report) => {
  console.log("Creating report with data:", data);
  try {
    const report = await prisma.reports.create({
      data: {
        gigId: data.gigId,
        repId: data.repId,
        reason: data.reason,
        imageUrl: data.imageUrl,
        latitude: data.latitude,
        longitude: data.longitude,
        location: data.location,
        companyId: data.companyId
      }
    });
    return report;
  } catch (error:unknown) {
    console.error("Error creating report:", error);
    return 'Error creating report';
  }
}


export const getReportByCompanyId = async (companyId: string) => {
  try {
    const reports = await prisma.reports.findMany({
      where: { companyId },
      select: {
        id: true,
        gigId: true,
        repId: true,
        reason: true,
        imageUrl: true,
        latitude: true,
        longitude: true,
        location: true,
        companyId: true,
        createdAt: true,
        updatedAt: true,
        rep: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      take:10
    });
    return reports;
  } catch (error:unknown) {
    console.error("Error fetching reports by company ID:", error);
    return 'Error fetching reports by company ID';
  }
}