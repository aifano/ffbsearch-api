import { Prisma } from '@prisma/client';
import { prisma } from '../utilities/prisma';

export const hauptartikeldatenOps = {
    insert: (data: Prisma.HauptartikeldatenCreateInput) => prisma.hauptartikeldaten.create({
        data
    }),
    update: (data: Prisma.HauptartikeldatenCreateInput) => prisma.hauptartikeldaten.update({
        where: {
            ROWKEY: data.ROWKEY
        },
        data
    }),
    upsert: async (data: Prisma.HauptartikeldatenCreateInput) => {
        const exists = await prisma.hauptartikeldaten.findUnique({
            where: {
                ROWKEY: data.ROWKEY
            }
        });

        if (exists?.ROWKEY) {
            await hauptartikeldatenOps.update(data);
        } else {
            await hauptartikeldatenOps.insert(data);
        }

        return !!exists?.ROWKEY;
    },
    delete: (data: Prisma.HauptartikeldatenCreateInput) => prisma.hauptartikeldaten.delete({
        where: {
            ROWKEY: data.ROWKEY
        }
    })
};
