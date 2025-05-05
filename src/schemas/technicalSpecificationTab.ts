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
        const result = await prisma.technicalSpecificationTab.createMany({
            data,
            skipDuplicates: true
        });

        const exists = result.count === 0;
        if (exists) {
            await technicalSpecificationTabObs.update(data);
        }

        return exists;
    },
    delete: (data: Prisma.TechnicalSpecificationTabCreateInput) => prisma.technicalSpecificationTab.delete({
        where: {
            ROWKEY: data.ROWKEY
        }
    })
};
