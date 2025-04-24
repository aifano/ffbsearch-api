import { Prisma } from '@prisma/client';
import { prisma } from '../utilities/prisma';

export const merkmalsdatenOps = {
    insert: (data: Prisma.MerkmalsdatenCreateInput) => prisma.merkmalsdaten.create({
        data
    }),
    update: (data: Prisma.MerkmalsdatenCreateInput) => prisma.merkmalsdaten.update({
        where: { ROWKEY: data.ROWKEY },
        data
    }),
    upsert: async (data: Prisma.MerkmalsdatenCreateInput) => {
        const exists = await prisma.merkmalsdaten.findUnique({
            where: { ROWKEY: data.ROWKEY }
        });

        if (exists?.ROWKEY) {
            await merkmalsdatenOps.update(data);
        } else {
            await merkmalsdatenOps.insert(data);
        }

        return !!exists?.ROWKEY;
    },
    delete: (data: Prisma.MerkmalsdatenCreateInput) => prisma.merkmalsdaten.delete({
        where: { ROWKEY: data.ROWKEY },
    }),
};
