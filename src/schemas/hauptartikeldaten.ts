import { Prisma } from '@prisma/client';
import { prisma } from '../utilities/prisma';

export const hauptartikeldatenOps = {
    insert: (data: Prisma.HauptartikeldatenCreateInput) => prisma.hauptartikeldaten.create({
        data
    }),
    update: (data: Prisma.HauptartikeldatenCreateInput) => prisma.hauptartikeldaten.update({
        where: { PART_NO: data.PART_NO },
        data
    }),
    upsert: async (data: Prisma.HauptartikeldatenCreateInput) => {
        const exists = await prisma.hauptartikeldaten.findUnique({
            where: { PART_NO: data.PART_NO },
        });

        if (exists?.PART_NO) {
            await hauptartikeldatenOps.update(data);
        } else {
            await hauptartikeldatenOps.insert(data);
        }

        return !!exists?.PART_NO;
    },
    delete: (data: Prisma.HauptartikeldatenCreateInput) => prisma.hauptartikeldaten.delete({
        where: { PART_NO: data.PART_NO },
    }),
};
