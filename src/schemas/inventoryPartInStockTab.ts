import { Prisma } from '@prisma/client';
import { prisma } from '../utilities/prisma';

export const inventoryPartInStockTabOps = {
    tableName: '__inventory_part_in_stock_tab',

    insert: (data: Prisma.InventoryPartInStockTabCreateInput) => prisma.inventoryPartInStockTab.create({
        data
    }),
    update: (data: Prisma.InventoryPartInStockTabCreateInput) => prisma.inventoryPartInStockTab.update({
        where: {
            ROWKEY: data.ROWKEY
        },
        data
    }),
    upsert: async (data: Prisma.InventoryPartInStockTabCreateInput) => {
        const result = await prisma.inventoryPartInStockTab.createMany({
            data,
            skipDuplicates: true,
        });

        const existed = result.count === 0;
        if ( existed ) {
            inventoryPartInStockTabOps.update(data);
        }

        return existed;
    },
    delete: (data: Prisma.InventoryPartInStockTabCreateInput) => prisma.inventoryPartInStockTab.delete({
        where: {
            ROWKEY: data.ROWKEY
        },
    }),
    buildSql: (action: string, cols: string, vals: string, data: Prisma.InventoryPartInStockTabCreateInput) => {
        let sqlStmt = '';
        if (action === 'delete') {
            sqlStmt = `DELETE FROM "${inventoryPartInStockTabOps.tableName}" WHERE ROWKEY='${data.ROWKEY}';`;
        } else if (action === 'insert' || action === 'upsert') {
            sqlStmt = `INSERT INTO "${inventoryPartInStockTabOps.tableName}" (${cols}) VALUES (${vals}) ON CONFLICT ("ROWKEY") DO UPDATE SET ${Object.entries(data).map(([k, v]) => `"${k}"='${v}'`).join(',')};`;
        } else if (action === 'update') {
            sqlStmt = `UPDATE "${inventoryPartInStockTabOps.tableName}" SET ${Object.entries(data).map(([k, v]) => `"${k}"='${v}'`).join(',')} WHERE ROWKEY='${data.ROWKEY}';`;
        }
        return sqlStmt;
    }
};
