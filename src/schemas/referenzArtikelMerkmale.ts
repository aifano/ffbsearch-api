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
    upsert: async (data: Prisma.ReferenzArtikelMerkmaleCreateInput) => {
        const exists = await prisma.referenzArtikelMerkmale.findUnique({
            where: { TECHNICAL_SPEC_NO: data.TECHNICAL_SPEC_NO },
        });

        if (exists?.TECHNICAL_SPEC_NO) {
            await referenzArtikelMerkmaleOps.update(data);
        } else {
            await referenzArtikelMerkmaleOps.insert(data);
        }

        return !!exists?.TECHNICAL_SPEC_NO;
    },
    delete: (data: Prisma.ReferenzArtikelMerkmaleCreateInput) => prisma.referenzArtikelMerkmale.delete({
        where: { TECHNICAL_SPEC_NO: data.TECHNICAL_SPEC_NO },
    }),
};
