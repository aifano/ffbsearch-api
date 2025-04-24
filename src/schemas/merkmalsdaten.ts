import { Prisma } from '@prisma/client';
import { prisma } from '../utilities/prisma';

export const merkmalsdatenOps = {
    insert: (data: Prisma.MerkmalsdatenCreateInput) => prisma.merkmalsdaten.create({
        data
    }),
    update: (data: Prisma.MerkmalsdatenCreateInput) => prisma.merkmalsdaten.update({
        where: { TECHNICAL_SPEC_NO: data.TECHNICAL_SPEC_NO },
        data
    }),
    upsert: async (data: Prisma.MerkmalsdatenCreateInput) => {
        const exists = await prisma.merkmalsdaten.findUnique({
            where: { TECHNICAL_SPEC_NO: data.TECHNICAL_SPEC_NO },
        });

        if (exists?.TECHNICAL_SPEC_NO) {
            await merkmalsdatenOps.update(data);
        } else {
            await merkmalsdatenOps.insert(data);
        }

        return !!exists?.TECHNICAL_SPEC_NO;
    },
    delete: (data: Prisma.MerkmalsdatenCreateInput) => prisma.merkmalsdaten.delete({
        where: { TECHNICAL_SPEC_NO: data.TECHNICAL_SPEC_NO },
    }),
};
