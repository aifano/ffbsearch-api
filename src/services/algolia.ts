import { algolia } from "../utilities/algolia";
import { INDEX_NAME } from "../utilities/config";
import { prisma } from "../utilities/prisma";

export const handleAlgoliaUpdate = async (_partNumbers: string[]) => {
    // 1) Fetch part catalog entries
    const catalogEntries = await prisma.partCatalogTab.findMany({
        where: {
            PART_NO: {
                in: _partNumbers
            }
        },
        select: {
            PART_NO: true,
            DESCRIPTION: true,
            INFO_TEXT: true,
            WEIGHT_NET: true,
            UOM_FOR_WEIGHT_NET: true,
            UNIT_CODE: true
        }
    });
    const partNumbers = Array.from(new Set(catalogEntries.map(entry => entry?.PART_NO || '')));

    // 2) Fetch technical object references for each part
    const referenceKeyValues = Array.from(new Set(catalogEntries.map(entry => `${entry.PART_NO}^`)));
    const objectReferences = await prisma.technicalObjectReferenceTab.findMany({
        where: {
            KEY_VALUE: {
                in: referenceKeyValues
            }
        },
        select: {
            KEY_VALUE: true,
            TECHNICAL_SPEC_NO: true
        }
    });
    const objectReferenceMap = partNumbers.reduce<Record<string, typeof objectReferences>>(
        (groupMap, partNumber) => {
            if (!groupMap[partNumber]) {
                groupMap[partNumber] = [];
            }
            const referencesForPart = objectReferences.filter(entry => entry.KEY_VALUE === `${partNumber}^`);
            groupMap[partNumber].push(...referencesForPart);
            return groupMap;
        }, {}
    );

    // 3) Fetch technical specifications
    const specificationNumbers = Array.from(new Set(objectReferences.map(entry => safeTrim(entry.TECHNICAL_SPEC_NO))));
    const specifications = await prisma.technicalSpecificationTab.findMany({
        where: {
            TECHNICAL_SPEC_NO: {
                in: specificationNumbers
            }
        },
        select: {
            TECHNICAL_SPEC_NO: true,
            TECHNICAL_CLASS: true,
            ATTRIBUTE: true,
            VALUE_TEXT: true,
            INFO: true
        }
    });
    const specificationMap = partNumbers.reduce<Record<string, typeof specifications>>(
        (groupMap, partNumber) => {
            if (!groupMap[partNumber]) {
                groupMap[partNumber] = [];
            }
            const specificationNumbers = Array.from(new Set((objectReferenceMap[partNumber] || []).map(entry => entry.TECHNICAL_SPEC_NO)));
            const referencesForPart = specifications.filter(entry => specificationNumbers.includes(entry.TECHNICAL_SPEC_NO));
            groupMap[partNumber].push(...referencesForPart);
            return groupMap;
        }, {}
    );

    // 4) Fetch mapping of technical class descriptions
    const technicalClassKeys = Array.from(new Set(specifications.map(entry => safeTrim(entry.TECHNICAL_CLASS))));
    const technicalClassDescriptions = await prisma.mappingTechnicalClassDescriptionView.findMany({
        where: {
            TECHNICAL_CLASS: {
                in: technicalClassKeys
            }
        },
        select: {
            TECHNICAL_CLASS: true,
            DESCRIPTION: true
        }
    });
    const classDescriptionMap = partNumbers.reduce<Record<string, typeof technicalClassDescriptions>>(
        (groupMap, partNumber) => {
            if (!groupMap[partNumber]) {
                groupMap[partNumber] = [];
            }
            const technicalClassKeys = Array.from(new Set((specificationMap[partNumber] || []).map(entry => entry.TECHNICAL_CLASS)));
            const referencesForPart = technicalClassDescriptions.filter(entry => technicalClassKeys.includes(entry.TECHNICAL_CLASS));
            groupMap[partNumber].push(...referencesForPart);
            return groupMap;
        }, {}
    );

    // 5) Fetch mapping of attribute descriptions
    const attributeKeys = Array.from(new Set(specifications.map(entry => safeTrim(entry.ATTRIBUTE))));
    const attributeDescriptions = await prisma.mappingAttributeDescriptionView.findMany({
        where: { ATTRIBUTE: { in: attributeKeys } }
    });
    const attributeDescriptionMap = partNumbers.reduce<Record<string, typeof attributeDescriptions>>(
        (groupMap, partNumber) => {
            if (!groupMap[partNumber]) {
                groupMap[partNumber] = [];
            }
            const attributeKeys = Array.from(new Set((specificationMap[partNumber] || []).map(entry => entry.ATTRIBUTE)));
            const referencesForPart = attributeDescriptions.filter(entry => attributeKeys.includes(entry.ATTRIBUTE));
            groupMap[partNumber].push(...referencesForPart);
            return groupMap;
        }, {}
    );

    // 6) Fetch inventory records
    const inventoryRecords = await prisma.inventoryPartInStockTab.findMany({
        where: {
            PART_NO: {
                in: partNumbers
            }
        },
        select: {
            PART_NO: true,
            QTY_ONHAND: true,
            CONTRACT: true,
            LAST_COUNT_DATE: true
        }
    });
    const inventoryMap = partNumbers.reduce<Record<string, typeof inventoryRecords>>(
        (groupMap, partNumber) => {
            if (!groupMap[partNumber]) {
                groupMap[partNumber] = [];
            }
            const inventoryRecordsForPart = inventoryRecords.filter(entry => entry.PART_NO === partNumber);
            groupMap[partNumber].push(...inventoryRecordsForPart);
            return groupMap;
        }, {}
    );

    // 7) Fetch location view entries
    const contractIdentifiers = Array.from(new Set(inventoryRecords.map(inventory => safeTrim(inventory.CONTRACT))));
    const locationEntries = await prisma.locationView.findMany({
        where: {
            LOCATION_ID: {
                in: contractIdentifiers
            }
        },
        select: {
            LOCATION_ID: true,
            LOCATION_NAME: true
        }
    });
    const locationMap = partNumbers.reduce<Record<string, typeof locationEntries>>(
        (groupMap, partNumber) => {
            if (!groupMap[partNumber]) {
                groupMap[partNumber] = [];
            }
            const contractIdentifiers = Array.from(new Set((inventoryMap[partNumber] || []).map(entry => safeTrim(entry.CONTRACT))));
            const inventoryRecordsForPart = locationEntries.filter(entry => contractIdentifiers.includes(entry.LOCATION_ID));
            groupMap[partNumber].push(...inventoryRecordsForPart);
            return groupMap;
        }, {}
    );

    // 8) Build Algolia records for each part
    const algoliaRecords = catalogEntries.map(catalogEntry => {
        const partNumber = safeTrim(catalogEntry.PART_NO);

        // Build properties from specifications
        const specificationsForPart = specificationMap[partNumber] || [];
        const technicalClassDescriptionsForPart = classDescriptionMap[partNumber] || [];
        const attributeDescriptionsForPart = attributeDescriptionMap[partNumber] || [];
        const inventoryForPart = inventoryMap[partNumber] || [];
        const locationEntriesForPart = locationMap[partNumber] || [];

        // properties
        const properties = specificationsForPart.flatMap((specification) => {
            const attributeDescription = attributeDescriptionsForPart.find((entry) => entry.ATTRIBUTE === specification.ATTRIBUTE);
            const technicalClassDescription = technicalClassDescriptionsForPart.find((entry) => entry.TECHNICAL_CLASS === specification.TECHNICAL_CLASS);
            return [
                {
                    name: attributeDescription?.DESCRIPTION || specification.ATTRIBUTE,
                    value: safeText(specification.VALUE_TEXT),
                    technicalClassName: technicalClassDescription?.DESCRIPTION || specification.TECHNICAL_CLASS!,
                    info: safeText(specification.INFO) || undefined,
                },
            ];
        });

        // // Build stock details
        const stockDetails = inventoryForPart.map((inventory) => {
            const location = locationEntriesForPart.find((entry) => entry.LOCATION_ID === inventory.CONTRACT);
            return {
                qty: parseFloat(inventory?.QTY_ONHAND?.replace(",", ".") || '0.0') || 0,
                warehouse: location?.LOCATION_NAME || "unbekannt",
                lastCountDate: inventory.LAST_COUNT_DATE,
                unit: catalogEntry.UNIT_CODE,
                locationId: location?.LOCATION_ID,
            };
        });
        const totalStock = stockDetails.reduce((sum, s) => sum + s.qty, 0);

        // // Compute searchable text and stock summary
        const propSearchTexts = properties.map((p) => safeText(`${p.name} ${p.value}`));
        const searchableText = [safeText(catalogEntry.DESCRIPTION), safeText(catalogEntry.INFO_TEXT)]
            .concat(propSearchTexts)
            .filter(Boolean)
            .join(" ");

        return {
            objectID: partNumber,
            articleNo: partNumber,
            description: catalogEntry.DESCRIPTION,
            infoText: safeText(catalogEntry.INFO_TEXT),
            searchableText,
            weight: catalogEntry.WEIGHT_NET ? parseFloat(catalogEntry.WEIGHT_NET.replace(',', '.')) : undefined,
            weightUnit: catalogEntry.UOM_FOR_WEIGHT_NET,
            properties,
            categories: Array.from(new Set(properties.map(prop => prop.technicalClassName))),
            totalStock,
            inStock: totalStock > 0,
            stockDetails
        };
    });

    // 9) Push all records to Algolia in one batch
    if (algoliaRecords.length > 0) {
        console.log(`Pushing ${algoliaRecords.length} records to Algolia...`);
        await algolia.saveObjects({
            indexName: INDEX_NAME,
            objects: algoliaRecords
        });
    }
};

const safeTrim = (value?: string | null): string => {
    return typeof value === "string" ? value.trim() : "";
};

const safeText = (text?: string | null): string => {
    const trimmed = safeTrim(text);
    return trimmed.toLowerCase() === "null" ? "" : trimmed;
};
