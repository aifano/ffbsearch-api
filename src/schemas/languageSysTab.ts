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
        const exists = await prisma.languageSysTab.findUnique({
            where: {
                ATTRIBUTE_LANG_CODE_PATH: {
                    ATTRIBUTE: data.ATTRIBUTE,
                    LANG_CODE: data.LANG_CODE,
                    PATH: data.PATH
                }
            }
        });

        if (exists?.PATH) {
            await languageSysTabOps.update(data);
        } else {
            await languageSysTabOps.insert(data);
        }

        return !!exists?.PATH;
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
