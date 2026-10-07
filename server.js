import express from 'express';
import { spotsRouter } from './routes/spots.js';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));
app.use('/api/spots', spotsRouter);

app.listen(port, () => {
  console.log(`FlatFinder running at http://localhost:${port}`);
});
