import { Prisma } from '@prisma/client';
import { prisma } from '../utilities/prisma';

export const partCatalogTabObs = {
    tableName: '__part_catalog_tab',

    insert: (data: Prisma.PartCatalogTabCreateInput) => prisma.partCatalogTab.create({
        data
    }),
    update: (data: Prisma.PartCatalogTabCreateInput) => prisma.partCatalogTab.update({
        where: {
            ROWKEY: data.ROWKEY
        },
        data
    }),
    upsert: async (data: Prisma.PartCatalogTabCreateInput) => {
        const result = await prisma.partCatalogTab.createMany({
            data,
            skipDuplicates: true
        });

        const exists = result.count === 0;
        if (exists) {
            await partCatalogTabObs.update(data);
        }

        return exists;
    },
    delete: (data: Prisma.PartCatalogTabCreateInput) => prisma.partCatalogTab.delete({
        where: {
            ROWKEY: data.ROWKEY
        }
    }),
    buildSql: (action: string, cols: string, vals: string, data: Prisma.PartCatalogTabCreateInput) => {
        let sqlStmt = '';
        if (action === 'delete') {
            sqlStmt = `DELETE FROM "${partCatalogTabObs.tableName}" WHERE ROWKEY='${data.ROWKEY}';`;
        } else if (action === 'insert' || action === 'upsert') {
            sqlStmt = `INSERT INTO "${partCatalogTabObs.tableName}" (${cols}) VALUES (${vals}) ON CONFLICT ("ROWKEY") DO UPDATE SET ${Object.entries(data).map(([k, v]) => `"${k}"='${v}'`).join(',')};`;
        } else if (action === 'update') {
            sqlStmt = `UPDATE "${partCatalogTabObs.tableName}" SET ${Object.entries(data).map(([k, v]) => `"${k}"='${v}'`).join(',')} WHERE ROWKEY='${data.ROWKEY}';`;
        }
        return sqlStmt;
    }
};
