import { Prisma } from '@prisma/client';
import { prisma } from '../utilities/prisma';

export const inventoryPartInStockTabOps = {
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
    })
};
