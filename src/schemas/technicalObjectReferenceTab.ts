import { Prisma } from '@prisma/client';
import { prisma } from '../utilities/prisma';

export const technicalObjectReferenceTabObs = {
    insert: (data: Prisma.TechnicalObjectReferenceTabCreateInput) => prisma.technicalObjectReferenceTab.create({
        data
    }),
    update: (data: Prisma.TechnicalObjectReferenceTabCreateInput) => prisma.technicalObjectReferenceTab.update({
        where: {
            ROWKEY: data.ROWKEY
        },
        data
    }),
    upsert: async (data: Prisma.TechnicalObjectReferenceTabCreateInput) => {
        const result = await prisma.technicalObjectReferenceTab.createMany({
            data,
            skipDuplicates: true
        });

        const existed = result.count === 0;
        if (existed) {
            await technicalObjectReferenceTabObs.update(data);
        }

        return existed;
    },
    delete: (data: Prisma.TechnicalObjectReferenceTabCreateInput) => prisma.technicalObjectReferenceTab.delete({
        where: {
            ROWKEY: data.ROWKEY
        }
    }),
};
