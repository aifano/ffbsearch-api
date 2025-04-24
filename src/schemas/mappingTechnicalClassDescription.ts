import { Prisma } from '@prisma/client';
import { prisma } from '../utilities/prisma';

export const mappingTechnicalClassDescriptionOps = {
    insert: (data: Prisma.MappingTechnicalClassDescriptionCreateInput) => prisma.mappingTechnicalClassDescription.create({
        data
    }),
    update: (data: Prisma.MappingTechnicalClassDescriptionCreateInput) => prisma.mappingTechnicalClassDescription.update({
        where: { TECHNICAL_CLASS: data.TECHNICAL_CLASS },
        data
    }),
    upsert: async (data: Prisma.MappingTechnicalClassDescriptionCreateInput) => {
        const exists = await prisma.mappingTechnicalClassDescription.findUnique({
            where: { TECHNICAL_CLASS: data.TECHNICAL_CLASS },
        });

        if (exists?.TECHNICAL_CLASS) {
            await mappingTechnicalClassDescriptionOps.update(data);
        } else {
            await mappingTechnicalClassDescriptionOps.insert(data);
        }

        return !!exists?.TECHNICAL_CLASS;
    },
    delete: (data: Prisma.MappingTechnicalClassDescriptionCreateInput) => prisma.mappingTechnicalClassDescription.delete({
        where: { TECHNICAL_CLASS: data.TECHNICAL_CLASS },
    }),
};
