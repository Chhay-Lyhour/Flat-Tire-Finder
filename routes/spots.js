import { Router } from 'express';
import { supabase, SPOT_COLUMNS } from '../lib/supabase.js';
import { validateSpot } from '../lib/validateSpot.js';

export const spotsRouter = Router();

// GET /api/spots → every repair spot, oldest first.
spotsRouter.get('/', async (req, res) => {
  const { data, error } = await supabase.from('spots').select(SPOT_COLUMNS).order('created_at');
  if (error) {
    console.error('Loading spots failed:', error.message);
    return res.status(500).json({ error: "Couldn't load repair spots" });
  }
  res.json(data);
});

// POST /api/spots → saves one driver-added spot and returns the saved row.
spotsRouter.post('/', async (req, res) => {
  const result = validateSpot(req.body);
  if (!result.ok) return res.status(400).json({ error: result.error });

  const { data, error } = await supabase.from('spots').insert(result.value).select(SPOT_COLUMNS).single();
  if (error) {
    console.error('Saving spot failed:', error.message);
    return res.status(500).json({ error: "Couldn't save" });
  }
  res.status(201).json(data);
});
