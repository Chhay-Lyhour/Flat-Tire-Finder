import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { spotsRouter } from './routes/spots.js';

const app = express();
const port = process.env.PORT || 3000;

// Resolve public/ next to this file, not the folder the process started in
// (on Vercel those differ, and "/" would return "Cannot GET /").
const publicDir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'public');

app.use(express.json());
app.use(express.static(publicDir));
app.use('/api/spots', spotsRouter);

app.listen(port, () => {
  console.log(`FlatFinder running at http://localhost:${port}`);
});
