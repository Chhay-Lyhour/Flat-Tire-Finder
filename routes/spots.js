import { randomUUID } from 'node:crypto';
import { Router } from 'express';
import { supabase, SPOT_COLUMNS } from '../lib/supabase.js';
import { validateSpot } from '../lib/validateSpot.js';

export const spotsRouter = Router();

// GET /api/spots → every repair spot, oldest first. owner_token never leaves the server.
spotsRouter.get('/', async (req, res) => {
  const { data, error } = await supabase.from('spots').select(SPOT_COLUMNS).order('created_at');
  if (error) {
    console.error('Loading spots failed:', error.message);
    return res.status(500).json({ error: "Couldn't load repair spots" });
  }
  res.json(data);
});

// POST /api/spots → saves one driver-added spot. The response (only this one)
// includes a fresh owner_token so the browser can edit or delete it later.
spotsRouter.post('/', async (req, res) => {
  const result = validateSpot(req.body);
  if (!result.ok) return res.status(400).json({ error: result.error });

  const owner_token = randomUUID();
  const { data, error } = await supabase
    .from('spots')
    .insert({ ...result.value, owner_token })
    .select(`${SPOT_COLUMNS},owner_token`)
    .single();
  if (error) {
    console.error('Saving spot failed:', error.message);
    return res.status(500).json({ error: "Couldn't save" });
  }
  res.status(201).json(data);
});

// PATCH /api/spots/:id → updates a spot. Requires the X-Owner-Token handed back by POST;
// sample shops have no owner_token, so they can never match and can never be edited this way.
spotsRouter.patch('/:id', async (req, res) => {
  const token = req.get('X-Owner-Token');
  if (!token) return res.status(401).json({ error: 'Missing owner token' });

  const result = validateSpot(req.body);
  if (!result.ok) return res.status(400).json({ error: result.error });

  const { data, error } = await supabase
    .from('spots')
    .update(result.value)
    .eq('id', req.params.id)
    .eq('owner_token', token)
    .select(SPOT_COLUMNS)
    .single();
  if (error || !data) return res.status(403).json({ error: "Can't edit this spot" });
  res.json(data);
});

// DELETE /api/spots/:id → removes a spot. Same owner_token check as PATCH.
spotsRouter.delete('/:id', async (req, res) => {
  const token = req.get('X-Owner-Token');
  if (!token) return res.status(401).json({ error: 'Missing owner token' });

  const { data, error } = await supabase
    .from('spots')
    .delete()
    .eq('id', req.params.id)
    .eq('owner_token', token)
    .select('id')
    .single();
  if (error || !data) return res.status(403).json({ error: "Can't delete this spot" });
  res.json({ id: data.id });
});
