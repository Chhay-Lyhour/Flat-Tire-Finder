import { Router } from 'express';
import { supabase, SPOT_COLUMNS } from '../lib/supabase.js';

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
