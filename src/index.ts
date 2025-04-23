// src/index.ts
import express from 'express';
import { PORT } from './utilities/config';
import { router as syncRouter } from './routes/sync';

const app = express();

app.use(express.json());
app.use('/ifs-sync', syncRouter);

app.listen(PORT, () => {
  console.log(`IFS Sync API läuft auf Port ${PORT}`);
});
