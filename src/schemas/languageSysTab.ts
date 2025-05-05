import { Prisma } from '@prisma/client';
import { prisma } from '../utilities/prisma';

export const languageSysTabOps = {
    insert: (data: Prisma.LanguageSysTabCreateInput) => prisma.languageSysTab.create({
        data
    }),
    update: (data: Prisma.LanguageSysTabCreateInput) => prisma.languageSysTab.update({
        where: {
            ATTRIBUTE_LANG_CODE_PATH: {
                ATTRIBUTE: data.ATTRIBUTE,
                LANG_CODE: data.LANG_CODE,
                PATH: data.PATH
            }
        },
        data
    }),
    upsert: async (data: Prisma.LanguageSysTabCreateInput) => {
        const result = await prisma.languageSysTab.createMany({
            data,
            skipDuplicates: true
        });

        const existed = result.count === 0;
        if (existed) {
            await languageSysTabOps.update(data);
        }

        return existed;
    },
    delete: (data: Prisma.LanguageSysTabCreateInput) => prisma.languageSysTab.delete({
        where: {
            ATTRIBUTE_LANG_CODE_PATH: {
                ATTRIBUTE: data.ATTRIBUTE,
                LANG_CODE: data.LANG_CODE,
                PATH: data.PATH
            }
        }
    })
};
