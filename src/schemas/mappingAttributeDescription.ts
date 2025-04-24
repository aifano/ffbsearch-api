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
    upsert: async (data: Prisma.MappingAttributeDescriptionCreateInput) => {
        const exists = await prisma.mappingAttributeDescription.findUnique({
            where: { ATTRIBUTE: data.ATTRIBUTE }
        });

        if (exists?.ATTRIBUTE) {
            await mappingAttributeDescriptionOps.update(data);
        } else {
            await mappingAttributeDescriptionOps.insert(data);
        }

        return !!exists?.ATTRIBUTE;
    },
    delete: (data: Prisma.MappingAttributeDescriptionCreateInput) => prisma.mappingAttributeDescription.delete({
        where: { ATTRIBUTE: data.ATTRIBUTE },
    }),
};
