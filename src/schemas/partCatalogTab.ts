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
        const result = await prisma.partCatalogTab.createMany({
            data,
            skipDuplicates: true
        });

        const exists = result.count === 0;
        if (exists) {
            await partCatalogTabObs.update(data);
        }

        return exists;
    },
    delete: (data: Prisma.PartCatalogTabCreateInput) => prisma.partCatalogTab.delete({
        where: {
            ROWKEY: data.ROWKEY
        }
    })
};
