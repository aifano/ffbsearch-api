import express from 'express';
import { handlePrismaSync } from '../services/ifs';

export const router = express.Router();

router.post('/:table', async (req, res) => {
    const { table } = req.params;
    const { action, data } = req.body;

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
