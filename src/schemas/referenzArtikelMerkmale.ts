import { Prisma } from '@prisma/client';
import { prisma } from '../utilities/prisma';

export const referenzArtikelMerkmaleOps = {
    insert: (data: Prisma.ReferenzArtikelMerkmaleCreateInput) => prisma.referenzArtikelMerkmale.create({
        data
    }),
    update: (data: Prisma.ReferenzArtikelMerkmaleCreateInput) => prisma.referenzArtikelMerkmale.update({
        where: {
            ROWKEY: data.ROWKEY
        },
        data
    }),
    upsert: async (data: Prisma.ReferenzArtikelMerkmaleCreateInput) => {
        const exists = await prisma.referenzArtikelMerkmale.findUnique({
            where: {
                ROWKEY: data.ROWKEY
            }
        });

        if (exists?.ROWKEY) {
            await referenzArtikelMerkmaleOps.update(data);
        } else {
            await referenzArtikelMerkmaleOps.insert(data);
        }

        return !!exists?.ROWKEY;
    },
    delete: (data: Prisma.ReferenzArtikelMerkmaleCreateInput) => prisma.referenzArtikelMerkmale.delete({
        where: {
            ROWKEY: data.ROWKEY
        }
    }),
};
