import { inventoryPartInStockTabOps } from '../schemas/inventoryPartInStockTab';
import { languageSysTabOps } from '../schemas/languageSysTab';
import { Prisma } from '@prisma/client';
import { partCatalogTabObs } from '../schemas/partCatalogTab';
import { technicalObjectReferenceTabObs } from '../schemas/technicalObjectReferenceTab';
import { technicalSpecificationTabObs } from '../schemas/technicalSpecificationTab';
import { logSyncStart, logSyncSuccess, logSyncError } from '../utilities/logger';


type OpsType = {
  insert: (data: any) => Promise<any>;
  update: (data: any) => Promise<any>;
  upsert: (data: any) => Promise<any>;
  delete: (data: any) => Promise<any>;
  buildSql: (action: string, cols: string, vals: string, data: any) => string;
};

const tableOpsMapping: Record<string, OpsType> = {
  'inventory_part_in_stock_tab':    inventoryPartInStockTabOps,
  'artikelbestand':                 inventoryPartInStockTabOps,
  'language_sys_tab':               languageSysTabOps,
  'part_catalog_tab':               partCatalogTabObs,
  'hauptartikeldaten':              partCatalogTabObs,
  'technical_object_reference_tab': technicalObjectReferenceTabObs,
  'referenz-artikel-merkmale':      technicalObjectReferenceTabObs,
  'technical_specification_tab':    technicalSpecificationTabObs,
  'merkmalsdaten':                  technicalSpecificationTabObs
}

export const handlePrismaSync = async (table: string, action: string, data: any) => {
  // Start logging
  logSyncStart(table, action, data);

  if (!(table in tableOpsMapping)) {
    const error = new Error('Invalid table name');
    logSyncError(table, action, data, error, { status: 400, message: 'Invalid table name' });
    return { status: 400, message: 'Invalid table name' };
  }

  if (!['insert', 'update', 'upsert', 'delete'].includes(action)) {
    const error = new Error('Invalid action');
    logSyncError(table, action, data, error, { status: 400, message: 'Invalid action' });
    return { status: 400, message: 'Invalid action' };
  }

  const result = await sync(tableOpsMapping[table], action, data);

  // Success/Error logging
  if (result.status === 200) {
    logSyncSuccess(table, action, data, result);
  } else {
    const error = new Error(result.message);
    logSyncError(table, action, data, error, result);
  }

  return { status: result.status === 200 ? 200 : result.status, message: result.message };
};

const sync = async (
  ops: OpsType,
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
    const mapped = mapPrismaError(error);
    logSyncError('unknown', action, data, error, mapped);
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
