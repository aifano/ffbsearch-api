import { Prisma } from '@prisma/client';
import { prisma } from '../utilities/prisma';

export const partCatalogTabObs = {
    insert: (data: Prisma.PartCatalogTabCreateInput) => prisma.partCatalogTab.create({
        data
    }),
    update: (data: Prisma.PartCatalogTabCreateInput) => prisma.partCatalogTab.update({
        where: {
            ROWKEY: data.ROWKEY
        },
        data
    }),
    upsert: async (data: Prisma.PartCatalogTabCreateInput) => {
        const exists = await prisma.partCatalogTab.findUnique({
            where: {
                ROWKEY: data.ROWKEY
            }
        });

        if (exists?.ROWKEY) {
            await partCatalogTabObs.update(data);
        } else {
            await partCatalogTabObs.insert(data);
        }

        return !!exists?.ROWKEY;
    },
    delete: (data: Prisma.PartCatalogTabCreateInput) => prisma.partCatalogTab.delete({
        where: {
            ROWKEY: data.ROWKEY
        }
    })
};
