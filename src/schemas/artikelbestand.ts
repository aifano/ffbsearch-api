import { Prisma } from '@prisma/client';
import { prisma } from '../utilities/prisma';

export const artikelbestandOps = {
    insert: (data: Prisma.ArtikelbestandCreateInput) => prisma.artikelbestand.create({
        data
    }),
    update: (data: Prisma.ArtikelbestandCreateInput) => prisma.artikelbestand.update({
        where: { PART_NO: data.PART_NO },
        data
    }),
    upsert: async (data: Prisma.ArtikelbestandCreateInput) => {
        const exists = await prisma.artikelbestand.findUnique({
            where: { PART_NO: data.PART_NO },
        });

        if (exists?.PART_NO) {
            await artikelbestandOps.update(data);
        } else {
            await artikelbestandOps.insert(data);
        }

        return !!exists?.PART_NO;
    },
    delete: (data: Prisma.ArtikelbestandCreateInput) => prisma.artikelbestand.delete({
        where: { PART_NO: data.PART_NO },
    }),
};
