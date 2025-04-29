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
        const exists = await prisma.technicalObjectReferenceTab.findUnique({
            where: {
                ROWKEY: data.ROWKEY
            }
        });

        if (exists?.ROWKEY) {
            await technicalObjectReferenceTabObs.update(data);
        } else {
            await technicalObjectReferenceTabObs.insert(data);
        }

        return !!exists?.ROWKEY;
    },
    delete: (data: Prisma.TechnicalObjectReferenceTabCreateInput) => prisma.technicalObjectReferenceTab.delete({
        where: {
            ROWKEY: data.ROWKEY
        }
    }),
};
