import { Prisma } from '@prisma/client';
import { prisma } from '../utilities/prisma';

export const mappingAttributeDescriptionOps = {
    insert: (data: Prisma.MappingAttributeDescriptionCreateInput) => prisma.mappingAttributeDescription.create({
        data
    }),
    update: (data: Prisma.MappingAttributeDescriptionCreateInput) => prisma.mappingAttributeDescription.update({
        where: { ATTRIBUTE: data.ATTRIBUTE },
        data
    }),
    upsert: (data: Prisma.MappingAttributeDescriptionCreateInput) => prisma.mappingAttributeDescription.upsert({
        where: { ATTRIBUTE: data.ATTRIBUTE },
        update: data,
        create: data,
    }),
    delete: (data: Prisma.MappingAttributeDescriptionCreateInput) => prisma.mappingAttributeDescription.delete({
        where: { ATTRIBUTE: data.ATTRIBUTE },
    }),
};
