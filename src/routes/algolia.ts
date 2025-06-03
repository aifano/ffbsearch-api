import express from 'express';
import { prisma } from '../utilities/prisma';
import { handleAlgoliaUpdate } from '../services/algolia';

export const router = express.Router();

const technicalObjectReferenceToPartNos = async(technicalObjectReferences: {KEY_VALUE?: string | null}[]) => {
    const partNos = technicalObjectReferences.map((entry) => entry.KEY_VALUE?.replace("^", "")).filter((keyValue): keyValue is string => keyValue !== null);
    return Array.from(new Set(partNos));
};

const technicalSpecificationToPartNos = async(technicalSpecifications: {TECHNICAL_SPEC_NO?: string | null}[]) => {
    const technicalSpecNos = Array.from(
        new Set(technicalSpecifications.map((entry) => entry.TECHNICAL_SPEC_NO).filter((specNo): specNo is string => specNo !== null))
    );
    const technicalObjectReferences = await prisma.technicalObjectReferenceTab.findMany({
        where: {
            TECHNICAL_SPEC_NO: {
                in: technicalSpecNos
            }
        },
        select: {
            KEY_VALUE: true
        }
    });
    const partNos = await technicalObjectReferenceToPartNos(technicalObjectReferences);
    return Array.from(new Set(partNos));
};

const languageSysToPartNos = async(languageSys: {PATH?: string | null}[]) => {
    const pathParts = languageSys.map((entry) => entry.PATH?.split('.'));

    const technicalSpecificationAttributes = Array.from(new Set(pathParts.filter((parts): parts is string[] => parts !== undefined && parts.length >= 2 && parts[0] === 'TechnicalClass_APPSRV').map((parts) => parts[1]?.split('~')[0])));
    const technicalSpecifications = await prisma.technicalSpecificationTab.findMany({
        where: {
            ATTRIBUTE: {
                in: technicalSpecificationAttributes
            }
        },
        select: {
            TECHNICAL_SPEC_NO: true
        }
    });
    const technicalSpecificationPartNos = await technicalSpecificationToPartNos(technicalSpecifications);

    const technicalClassSpecNos = Array.from(new Set(pathParts.filter((parts): parts is string[] => parts !== undefined && parts.length >= 2 && parts[0] === 'TechnicalAttribStd_APPSRV').map((parts) => parts[1]?.split('_')[0])));
    const technicalObjectReferences = await prisma.technicalObjectReferenceTab.findMany({
        where: {
            TECHNICAL_SPEC_NO: {
                in: technicalClassSpecNos
            }
        },
        select: {
            KEY_VALUE: true
        }
    });
    const technicalObjectReferencePartNos = await technicalObjectReferenceToPartNos(technicalObjectReferences);

    const contracts = Array.from(new Set(pathParts.filter((parts): parts is string[] => parts !== undefined && parts.length >= 2 && parts[0] === 'InstallationSite_FNDBAS').map((parts) => parts[1])));
    const inventoryPartInStockContracts = await prisma.inventoryPartInStockTab.findMany({
        where: {
            CONTRACT: {
                in: contracts
            }
        },
        select: {
            PART_NO: true
        }
    });
    const inventoryPartInStockPartNos = inventoryPartInStockContracts.map((entry) => entry.PART_NO).filter((partNo): partNo is string => partNo !== null);

    return Array.from(new Set([...technicalSpecificationPartNos, ...technicalObjectReferencePartNos, ...inventoryPartInStockPartNos]));
};


router.get('/', async (req, res) => {
    try {
        // Last Update
        const lastBatch = await prisma.algoliaBatch.findFirst({
            orderBy: {
                synced_at: 'desc'
            }
        });
        const lastBatchDate = lastBatch?.synced_at || new Date(0);
        const newSyncedAt = new Date();

        // 1. inventoryPartInStockTab
        const inventoryPartInStocks = await prisma.inventoryPartInStockTab.findMany({
            where: {
                synced_at: {
                    gte: lastBatchDate
                }
            },
            select: {
                PART_NO: true
            }
        });
        const inventoryPartInStockPartNos = Array.from(new Set(inventoryPartInStocks.map((entry) => entry.PART_NO).filter((partNo): partNo is string => partNo !== null)));

        // 3. partCatalogTab
        const partCatalogs = await prisma.partCatalogTab.findMany({
            where: {
                synced_at: {
                    gte: lastBatchDate
                }
            },
            select: {
                PART_NO: true
            }
        });
        const partCatalogPartNos = Array.from(new Set(partCatalogs.map((entry) => entry.PART_NO).filter((partNo): partNo is string => partNo !== null)));

        // 5. technicalSpecificationTab
        const technicalSpecifications = await prisma.technicalSpecificationTab.findMany({
            where: {
                synced_at: {
                    gte: lastBatchDate
                }
            },
            select: {
                TECHNICAL_SPEC_NO: true
            }
        });
        const technicalSpecificationPartNos = await technicalSpecificationToPartNos(technicalSpecifications);

        // 4. technicalObjectReferenceTab
        const technicalObjectReferences = await prisma.technicalObjectReferenceTab.findMany({
            where: {
                synced_at: {
                    gte: lastBatchDate
                }
            },
            select: {
                KEY_VALUE: true
            }
        });
        const technicalObjectReferencePartNos = await technicalObjectReferenceToPartNos(technicalObjectReferences);

        // 2. languageSysTab
        const languageSys = await prisma.languageSysTab.findMany({
            where: {
                synced_at: {
                    gte: lastBatchDate
                }
            },
            select: {
                PATH: true
            }
        });
        const languageSysPartNos = await languageSysToPartNos(languageSys);

        const allPartNos = Array.from(
            new Set([
                ...inventoryPartInStockPartNos,
                ...partCatalogPartNos,
                ...technicalSpecificationPartNos,
                ...technicalObjectReferencePartNos,
                ...languageSysPartNos
            ])
        );

        await prisma.algoliaBatch.create({
            data: {
                synced_at: newSyncedAt,
                status: `Start syncing ${allPartNos.length} parts`
            }
        });

        const chunkSize = 1000;
        console.log(`Total Part Numbers to sync: ${allPartNos.length}`);
        for (let i = 0; i < allPartNos.length; i += chunkSize) {
            console.log(`Syncing Part Numbers ${i + 1} to ${Math.min(i + chunkSize, allPartNos.length)}`);
            const chunk = allPartNos.slice(i, i + chunkSize);
            await handleAlgoliaUpdate(chunk);
        }
        console.log('Syncing completed');
        res.status(200).json({ status: 'triggered' });
        return;
    } catch (error) {
        console.error('Sync Error:', error);
        res.status(500).json({ error: 'Internal server error' });
        return;
    }
});
