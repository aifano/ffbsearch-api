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
    upsert: (data: Prisma.HauptartikeldatenCreateInput) => prisma.hauptartikeldaten.upsert({
        where: { PART_NO: data.PART_NO },
        update: data,
        create: data,
    }),
    delete: (data: Prisma.HauptartikeldatenCreateInput) => prisma.hauptartikeldaten.delete({
        where: { PART_NO: data.PART_NO },
    }),
};
