import express from 'express';
import { handlePrismaSync } from '../services/ifs';
import { prisma } from '../utilities/prisma';
import { inventoryPartInStockTabOps } from '../schemas/inventoryPartInStockTab';

const allowedTables = [
    'inventory_part_in_stock_tab',    // alias: artikelbestand
    'language_sys_tab',
    'part_catalog_tab',               // alias: hauptartikeldaten
    'technical_object_reference_tab', // alias: referenz-artikel-merkmale
    'technical_specification_tab',    // alias: merkmalsdaten

    // Aliases
    'artikelbestand',
    'hauptartikeldaten',
    'merkmalsdaten',
    'referenz-artikel-merkmale',
];

export const router = express.Router();

router.post('/:table', async (req, res) => {
    const { table } = req.params;
    const { action, data } = req.body;

    if (!allowedTables.includes(table)) {
        res.status(400).json({ error: 'Invalid table' });
        return;
    }
    if (!['insert', 'update', 'upsert', 'delete'].includes(action)) {
        res.status(400).json({ error: 'Invalid aktion' });
        return;
    }

    try {
        const result = await handlePrismaSync(table, action, data);
        res.status(result.status).json({ status: result.message });
        return;
    } catch (error) {
        console.error('Sync Error:', error);
        res.status(500).json({ error: 'Internal server error' });
        return;
    }
});
