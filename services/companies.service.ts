import { PrismaClient } from "../generated/prisma/index.js";
import type { Company } from "../types/company.type.js";

const prisma = new PrismaClient();

export const createCompany = async (data: Company): Promise<Company | string> => {
  try {
    const company = await prisma.companies.create({
      data: {
        name: data.name,
        email: data.email,
        password: data.password,
      },
    });
    return company;
  } catch (error: unknown) {
    console.error('Error creating company:', error);
    return "Error creating company";
  }
}

export const getCompanyByEmail = async (email: string) => {
  try {
    const company = await prisma.companies.findUnique({
      where: { email },
    });
    return company;
  } catch (error: unknown) {
    console.error('Error fetching company by email:', error);
    return 'Failed to fetch company';
  }
}

export const getStats = async (companyId: string) => {
  try {

    // const stats = await prisma.$transaction(async (tx) => {
    //   const gigsCount = await tx.gigs.count({
    //     where: { companyId }
    //   });

    //   const applicationsCount = await tx.applications.count({
    //     where: {
    //       gig: {
    //         companyId: companyId
    //       }
    //     }
    //   });

    //   const reportsCount = await tx.reports.count({
    //     where: { companyId }
    //   });

    //   return {
    //     gigsCount,
    //     applicationsCount,
    //     reportsCount
    //   };

    // });
    // return stats;

    const gigsCount = await prisma.gigs.count({
      where: { companyId }
    });

    const applicationsCount = await prisma.applications.count({
      where: {
        gig: {
          companyId: companyId
        }
      }
    });

    const reportsCount = await prisma.reports.count({
      where: { companyId }
    });

    const stats = {
      gigsCount,
      applicationsCount,
      reportsCount
    };

    return stats;

  } catch (error) {
    console.error('Error fetching stats:', error);
    return 'Failed to fetch stats';
  }

}