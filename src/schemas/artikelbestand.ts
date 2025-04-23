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
    upsert: (data: Prisma.ArtikelbestandCreateInput) => prisma.artikelbestand.upsert({
        where: { PART_NO: data.PART_NO },
        update: data,
        create: data,
    }),
    delete: (data: Prisma.ArtikelbestandCreateInput) => prisma.artikelbestand.delete({
        where: { PART_NO: data.PART_NO },
    }),
};
