import { Prisma } from '@prisma/client';
import { prisma } from '../utilities/prisma';

export const artikelbestandOps = {
    insert: (data: Prisma.ArtikelbestandCreateInput) => prisma.artikelbestand.create({
        data
    }),
    update: (data: Prisma.ArtikelbestandCreateInput) => prisma.artikelbestand.update({
        where: {
            ROWKEY: data.ROWKEY
        },
        data
    }),
    upsert: async (data: Prisma.ArtikelbestandCreateInput) => {
        const exists = await prisma.artikelbestand.findUnique({
            where: {
                ROWKEY: data.ROWKEY
            }
        });

        if (exists?.ROWKEY) {
            await artikelbestandOps.update(data);
        } else {
            await artikelbestandOps.insert(data);
        }

        return !!exists?.ROWKEY;
    },
    delete: (data: Prisma.ArtikelbestandCreateInput) => prisma.artikelbestand.delete({
        where: {
            ROWKEY: data.ROWKEY
        },
    })
};
