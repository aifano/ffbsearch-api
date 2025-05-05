import { inventoryPartInStockTabOps } from '../schemas/inventoryPartInStockTab';
import { languageSysTabOps } from '../schemas/languageSysTab';
import { Prisma } from '@prisma/client';
import { partCatalogTabObs } from '../schemas/partCatalogTab';
import { technicalObjectReferenceTabObs } from '../schemas/technicalObjectReferenceTab';
import { technicalSpecificationTabObs } from '../schemas/technicalSpecificationTab';


export const handlePrismaSync = async (table: string, action: string, data: any) => {
  console.log(`Start ${action} for table ${table}`);
  switch (table) {
    case 'inventory_part_in_stock_tab':
    case 'artikelbestand':
      return await sync(inventoryPartInStockTabOps, action, data);

    case 'language_sys_tab':
      return await sync(languageSysTabOps, action, data);

    case 'part_catalog_tab':
    case 'hauptartikeldaten':
      return await sync(partCatalogTabObs, action, data);

    case 'technical_object_reference_tab':
    case 'referenz-artikel-merkmale':
      return await sync(technicalObjectReferenceTabObs, action, data);

    case 'technical_specification_tab':
    case 'merkmalsdaten':
      return await sync(technicalSpecificationTabObs, action, data);

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
        return { status: 200, message: 'inserted' };
      case 'update':
        await ops.update(data);
        return { status: 200, message: 'updated' };
      case 'upsert':
        const exists = await ops.upsert(data);

        return {
          status: 200,
          message: exists ? 'updated' : 'inserted',
        };
      case 'delete':
        await ops.delete(data);
        return { status: 200, message: 'deleted' };
      default:
        throw new Error('Unknown action');
    }
  } catch (error) {
    console.error('Error during sync', {data, error});
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
