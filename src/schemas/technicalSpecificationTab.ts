import { Prisma } from '@prisma/client';
import { prisma } from '../utilities/prisma';

export const technicalSpecificationTabObs = {
    insert: (data: Prisma.TechnicalSpecificationTabCreateInput) => prisma.technicalSpecificationTab.create({
        data
    }),
    update: (data: Prisma.TechnicalSpecificationTabCreateInput) => prisma.technicalSpecificationTab.update({
        where: {
            ROWKEY: data.ROWKEY
        },
        data
    }),
    upsert: async (data: Prisma.TechnicalSpecificationTabCreateInput) => {
        const exists = await prisma.technicalSpecificationTab.findUnique({
            where: {
                ROWKEY: data.ROWKEY
            }
        });

        if (exists?.ROWKEY) {
            await technicalSpecificationTabObs.update(data);
        } else {
            await technicalSpecificationTabObs.insert(data);
        }

        return !!exists?.ROWKEY;
    },
    delete: (data: Prisma.TechnicalSpecificationTabCreateInput) => prisma.technicalSpecificationTab.delete({
        where: {
            ROWKEY: data.ROWKEY
        }
    })
};
