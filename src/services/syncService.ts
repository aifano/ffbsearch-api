import { artikelbestandOps } from '../schemas/artikelbestand';
import { hauptartikeldatenOps } from '../schemas/hauptartikeldaten';
import { locationsOps } from '../schemas/locations';
import { mappingAttributeDescriptionOps } from '../schemas/mappingAttributeDescription';
import { mappingTechnicalClassDescriptionOps } from '../schemas/mappingTechnicalClassDescription';
import { merkmalsdatenOps } from '../schemas/merkmalsdaten';
import { referenzArtikelMerkmaleOps } from '../schemas/referenzArtikelMerkmale';
import { Prisma } from '@prisma/client';


export const handlePrismaSync = async (table: string, action: string, data: any) => {
  switch (table) {
    case 'artikelbestand':
      return await sync(artikelbestandOps, action, data);
    case 'hauptartikeldaten':
      return await sync(hauptartikeldatenOps, action, data);
    case 'locations':
      return await sync(locationsOps, action, data);
    case 'mapping-attribute':
      return await sync(mappingAttributeDescriptionOps, action, data);
    case 'mapping-techclass':
      return await sync(mappingTechnicalClassDescriptionOps, action, data);
    case 'merkmalsdaten':
      return await sync(merkmalsdatenOps, action, data);
    case 'referenz-artikel-merkmale':
      return await sync(referenzArtikelMerkmaleOps, action, data);
    default:
      throw new Error('Table not found');
  }
};

const sync = async (
  ops: {
    insert: (data: any) => Promise<any>;
    update: (data: any) => Promise<any>;
    upsert: (data: any) => Promise<any>;
    delete: (data: any) => Promise<any>;
  },
  action: string,
  data: any
) => {
  try {
    switch (action) {
      case 'insert':
        await ops.insert(data);
        return { status: 201, message: 'inserted' };
      case 'update':
        await ops.update(data);
        return { status: 200, message: 'updated' };
      case 'upsert':
        await ops.upsert(data);
        return { status: 200, message: 'upserted' };
      case 'delete':
        await ops.delete(data);
        return { status: 200, message: 'deleted' };
      default:
        throw new Error('Unknown action');
    }
  } catch (error) {
    const mapped = mapPrismaError(error);
    return { status: mapped.status, message: mapped.message };
  }
};

export function mapPrismaError(error: unknown): { status: number; message: string } {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2025':
        return { status: 404, message: 'Record not found' };
      case 'P2002':
        return { status: 409, message: 'Duplicate resource' };
      case 'P2003':
        return { status: 409, message: 'Related resource does not exist' };
      default:
        return { status: 400, message: 'Bad request' };
    }
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return { status: 422, message: 'Validation failed' };
  }

  if (error instanceof Prisma.PrismaClientInitializationError || error instanceof Prisma.PrismaClientRustPanicError) {
    return { status: 500, message: 'Internal server error' };
  }

  return { status: 500, message: 'Unknown server error' };
}
