import { Prisma } from '@prisma/client';
import { prisma } from '../utilities/prisma';

export const technicalSpecificationTabObs = {
    tableName: '__technical_specification_tab',

    insert: (data: Prisma.TechnicalSpecificationTabCreateInput) => prisma.technicalSpecificationTab.create({
        data
    }),
    update: (data: Prisma.TechnicalSpecificationTabCreateInput) => prisma.technicalSpecificationTab.update({
        where: {
            ROWKEY: data.ROWKEY
        },
        data
    }),
    upsert: async (data: Prisma.TechnicalSpecificationTabCreateInput) => {
        const result = await prisma.technicalSpecificationTab.createMany({
            data,
            skipDuplicates: true
        });

        const exists = result.count === 0;
        if (exists) {
            await technicalSpecificationTabObs.update(data);
        }

        return exists;
    },
    delete: (data: Prisma.TechnicalSpecificationTabCreateInput) => prisma.technicalSpecificationTab.delete({
        where: {
            ROWKEY: data.ROWKEY
        }
    }),
    buildSql: (action: string, cols: string, vals: string, data: Prisma.TechnicalSpecificationTabCreateInput) => {
        let sqlStmt = '';
        if (action === 'delete') {
            sqlStmt = `DELETE FROM "${technicalSpecificationTabObs.tableName}" WHERE ROWKEY='${data.ROWKEY}';`;
        } else if (action === 'insert' || action === 'upsert') {
            sqlStmt = `INSERT INTO "${technicalSpecificationTabObs.tableName}" (${cols}) VALUES (${vals}) ON CONFLICT ("ROWKEY") DO UPDATE SET ${Object.entries(data).map(([k, v]) => `"${k}"='${v}'`).join(',')};`;
        } else if (action === 'update') {
            sqlStmt = `UPDATE "${technicalSpecificationTabObs.tableName}" SET ${Object.entries(data).map(([k, v]) => `"${k}"='${v}'`).join(',')} WHERE ROWKEY='${data.ROWKEY}';`;
        }
        return sqlStmt;
    }
};
