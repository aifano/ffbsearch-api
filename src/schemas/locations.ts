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
    upsert: (data: Prisma.LocationsCreateInput) => prisma.locations.upsert({
        where: { LOCATION_ID: data.LOCATION_ID },
        update: data,
        create: data,
    }),
    delete: (data: Prisma.LocationsCreateInput) => prisma.locations.delete({
        where: { LOCATION_ID: data.LOCATION_ID },
    }),
};
