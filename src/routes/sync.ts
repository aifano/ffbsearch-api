import express, { Router } from 'express';
import { handlePrismaSync } from '../services/syncService';

const allowedTables = [
  'artikelbestand',
  'hauptartikeldaten',
  'locations',
  'mapping-attribute',
  'mapping-techclass',
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
