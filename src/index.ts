import express from 'express';
import { PORT } from './utilities/config';
import { router as ifsSyncRouter } from './routes/ifs';
import { router as algoliaSyncRouter } from './routes/algolia';
import { repairAndParseJSON } from './utilities/jsonRepair';
import { logJsonRepairAttempt, logJsonRepairSuccess, logJsonRepairFailure, logServerStart } from './utilities/logger';

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
                const errorMessage = error instanceof Error ? error.message : String(error);
                logJsonRepairAttempt(body, errorMessage);

                // Try to repair and parse the JSON
                const repairResult = repairAndParseJSON(body);

                if (repairResult.success) {
                    logJsonRepairSuccess(body, repairResult.data);
                    req.body = repairResult.data;
                    next();
                } else {
                    logJsonRepairFailure(body, repairResult.error!);
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
  logServerStart(PORT);
});
