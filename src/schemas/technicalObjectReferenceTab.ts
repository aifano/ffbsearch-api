import { Prisma } from '@prisma/client';
import { prisma } from '../utilities/prisma';

export const technicalObjectReferenceTabObs = {
    tableName: '__technical_object_reference_tab',

    insert: (data: Prisma.TechnicalObjectReferenceTabCreateInput) => prisma.technicalObjectReferenceTab.create({
        data
    }),
    update: (data: Prisma.TechnicalObjectReferenceTabCreateInput) => prisma.technicalObjectReferenceTab.update({
        where: {
            ROWKEY: data.ROWKEY
        },
        data
    }),
    upsert: async (data: Prisma.TechnicalObjectReferenceTabCreateInput) => {
        const result = await prisma.technicalObjectReferenceTab.createMany({
            data,
            skipDuplicates: true
        });

        const existed = result.count === 0;
        if (existed) {
            await technicalObjectReferenceTabObs.update(data);
        }

        return existed;
    },
    delete: (data: Prisma.TechnicalObjectReferenceTabCreateInput) => prisma.technicalObjectReferenceTab.delete({
        where: {
            ROWKEY: data.ROWKEY
        }
    }),
    buildSql: (action: string, cols: string, vals: string, data: Prisma.TechnicalObjectReferenceTabCreateInput) => {
        let sqlStmt = '';
        if (action === 'delete') {
            sqlStmt = `DELETE FROM "${technicalObjectReferenceTabObs.tableName}" WHERE ROWKEY='${data.ROWKEY}';`;
        } else if (action === 'insert' || action === 'upsert') {
            sqlStmt = `INSERT INTO "${technicalObjectReferenceTabObs.tableName}" (${cols}) VALUES (${vals}) ON CONFLICT ("ROWKEY") DO UPDATE SET ${Object.entries(data).map(([k, v]) => `"${k}"='${v}'`).join(',')};`;
        } else if (action === 'update') {
            sqlStmt = `UPDATE "${technicalObjectReferenceTabObs.tableName}" SET ${Object.entries(data).map(([k, v]) => `"${k}"='${v}'`).join(',')} WHERE ROWKEY='${data.ROWKEY}';`;
        }
        return sqlStmt;
    }
};
