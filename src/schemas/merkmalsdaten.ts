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
    upsert: (data: Prisma.MerkmalsdatenCreateInput) => prisma.merkmalsdaten.upsert({
        where: { TECHNICAL_SPEC_NO: data.TECHNICAL_SPEC_NO },
        update: data,
        create: data,
    }),
    delete: (data: Prisma.MerkmalsdatenCreateInput) => prisma.merkmalsdaten.delete({
        where: { TECHNICAL_SPEC_NO: data.TECHNICAL_SPEC_NO },
    }),
};
