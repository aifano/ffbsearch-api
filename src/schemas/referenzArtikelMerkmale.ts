import { Prisma } from '@prisma/client';
import { prisma } from '../utilities/prisma';

export const referenzArtikelMerkmaleOps = {
    insert: (data: Prisma.ReferenzArtikelMerkmaleCreateInput) => prisma.referenzArtikelMerkmale.create({
        data
    }),
    update: (data: Prisma.ReferenzArtikelMerkmaleCreateInput) => prisma.referenzArtikelMerkmale.update({
        where: { TECHNICAL_SPEC_NO: data.TECHNICAL_SPEC_NO },
        data
    }),
    upsert: (data: Prisma.ReferenzArtikelMerkmaleCreateInput) => prisma.referenzArtikelMerkmale.upsert({
        where: { TECHNICAL_SPEC_NO: data.TECHNICAL_SPEC_NO },
        update: data,
        create: data,
    }),
    delete: (data: Prisma.ReferenzArtikelMerkmaleCreateInput) => prisma.referenzArtikelMerkmale.delete({
        where: { TECHNICAL_SPEC_NO: data.TECHNICAL_SPEC_NO },
    }),
};
