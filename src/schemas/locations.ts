import { Prisma } from '@prisma/client';
import { prisma } from '../utilities/prisma';

export const locationsOps = {
    insert: (data: Prisma.LocationsCreateInput) => prisma.locations.create({
        data
    }),
    update: (data: Prisma.LocationsCreateInput) => prisma.locations.update({
        where: { LOCATION_ID: data.LOCATION_ID },
        data
    }),
    upsert: async (data: Prisma.LocationsCreateInput) => {
        const exists = await prisma.locations.findUnique({
            where: { LOCATION_ID: data.LOCATION_ID }
        });

        if (exists?.LOCATION_ID) {
            await locationsOps.update(data);
        } else {
            await locationsOps.insert(data);
        }

        return !!exists?.LOCATION_ID;
    },
    delete: (data: Prisma.LocationsCreateInput) => prisma.locations.delete({
        where: { LOCATION_ID: data.LOCATION_ID },
    }),
};
