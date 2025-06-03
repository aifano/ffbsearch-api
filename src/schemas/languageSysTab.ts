import { Prisma } from '@prisma/client';
import { prisma } from '../utilities/prisma';

export const languageSysTabOps = {
    tableName: '__language_sys_tab',

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
    }),
    buildSql: (action: string, cols: string, vals: string, data: Prisma.LanguageSysTabCreateInput) => {
        let sqlStmt = '';
        if (action === 'delete') {
            sqlStmt = `DELETE FROM "${languageSysTabOps.tableName}" WHERE ATTRIBUTE='${data.ATTRIBUTE}' AND LANG_CODE='${data.LANG_CODE}' AND PATH='${data.PATH}';`;
        } else if (action === 'insert' || action === 'upsert') {
            sqlStmt = `INSERT INTO "${languageSysTabOps.tableName}" (${cols}) VALUES (${vals}) ON CONFLICT ("ROWKEY") DO UPDATE SET ${Object.entries(data).map(([k, v]) => `"${k}"='${v}'`).join(',')};`;
        } else if (action === 'update') {
            sqlStmt = `UPDATE "${languageSysTabOps.tableName}" SET ${Object.entries(data).map(([k, v]) => `"${k}"='${v}'`).join(',')} WHERE ATTRIBUTE='${data.ATTRIBUTE}' AND LANG_CODE='${data.LANG_CODE}' AND PATH='${data.PATH}';`;
        }
        return sqlStmt;
    }
};
