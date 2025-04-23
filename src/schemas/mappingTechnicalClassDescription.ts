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
    upsert: (data: Prisma.MappingTechnicalClassDescriptionCreateInput) => prisma.mappingTechnicalClassDescription.upsert({
        where: { TECHNICAL_CLASS: data.TECHNICAL_CLASS },
        update: data,
        create: data,
    }),
    delete: (data: Prisma.MappingTechnicalClassDescriptionCreateInput) => prisma.mappingTechnicalClassDescription.delete({
        where: { TECHNICAL_CLASS: data.TECHNICAL_CLASS },
    }),
};
