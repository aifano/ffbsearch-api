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
        const exists = await prisma.inventoryPartInStockTab.findUnique({
            where: {
                ROWKEY: data.ROWKEY
            }
        });

        if (exists?.ROWKEY) {
            await inventoryPartInStockTabOps.update(data);
        } else {
            await inventoryPartInStockTabOps.insert(data);
        }

        return !!exists?.ROWKEY;
    },
    delete: (data: Prisma.InventoryPartInStockTabCreateInput) => prisma.inventoryPartInStockTab.delete({
        where: {
            ROWKEY: data.ROWKEY
        },
    })
};
