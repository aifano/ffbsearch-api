// src/index.ts
import express from 'express';
import { PORT } from './utilities/config';
import { router as ifsSyncRouter } from './routes/ifs';
// import { router as algoliaSyncRouter } from './routes/algolia';

const app = express();


app.use(express.json({
    verify: (req, res, buf) => {
        (req as any).rawBody = buf.toString('utf8');
    }
}));

const jsonErrorHandler: express.ErrorRequestHandler = (err, req, res, next) => {
    if (err instanceof SyntaxError && res.statusCode === 400 && 'body' in err) {
        console.error("JSON parse error:", err, "Raw body:", (req as any).rawBody);
        res.status(400).json({ error: "Invalid JSON payload" });
    }
    next();
};
app.use(jsonErrorHandler);


app.use(express.json());
app.use('/ifs-sync', ifsSyncRouter);
// app.use('/algolia-sync', algoliaSyncRouter);

app.listen(PORT, () => {
  console.log(`IFS Sync API läuft auf Port ${PORT}`);
});
