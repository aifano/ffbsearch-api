import express from 'express';
import { PORT } from './utilities/config';
import { router as ifsSyncRouter } from './routes/ifs';
import { router as algoliaSyncRouter } from './routes/algolia';
import { repairAndParseJSON } from './utilities/jsonRepair';

const app = express();

// Custom middleware to handle JSON parsing with repair fallback
app.use((req, res, next) => {
    if (req.headers['content-type']?.includes('application/json')) {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                // First try normal JSON parsing
                req.body = JSON.parse(body);
                next();
            } catch (error) {
                console.log('JSON parse failed, attempting repair...', error);
                console.log('Raw body:', body);

                // Try to repair and parse the JSON
                const repairResult = repairAndParseJSON(body);

                if (repairResult.success) {
                    console.log('JSON repair successful!');
                    console.log('Repaired JSON:', JSON.stringify(repairResult.data, null, 2));
                    req.body = repairResult.data;
                    next();
                } else {
                    console.error('JSON repair failed:', repairResult.error);
                    res.status(400).json({
                        error: "Invalid JSON payload",
                        details: repairResult.error,
                        originalBody: body
                    });
                }
            }
        });
    } else {
        next();
    }
});

app.use('/ifs-sync', ifsSyncRouter);
app.use('/algolia-sync', algoliaSyncRouter);

app.listen(PORT, () => {
  console.log(`IFS Sync API läuft auf Port ${PORT}`);
});
