// Loads the labeled sample shops. Safe to re-run: it replaces sample rows only
// and never touches spots added by drivers.
import { supabase } from '../lib/supabase.js';

// Illustrative locations around Phnom Penh, not real businesses.
const SAMPLE_SHOPS = [
  { name: 'Sample: Stall near Independence Monument', lat: 11.5564, lng: 104.9310, vehicles: ['moto', 'tuktuk'], price_amount: 5000, price_currency: 'KHR', phone: '012 345 678' },
  { name: 'Sample: Repair shop by Central Market', lat: 11.5700, lng: 104.9200, vehicles: ['moto'], price_amount: 4000, price_currency: 'KHR', phone: null },
  { name: 'Sample: Roadside stall at Russian Market', lat: 11.5405, lng: 104.9195, vehicles: ['moto', 'tuktuk'], price_amount: null, price_currency: null, phone: '092 123 456' },
  { name: 'Sample: Tire shop on Monivong Blvd', lat: 11.5620, lng: 104.9165, vehicles: ['moto', 'tuktuk', 'car'], price_amount: 2.5, price_currency: 'USD', phone: '+855 16 789 012' },
  { name: 'Sample: Stall near Chbar Ampov bridge', lat: 11.5450, lng: 104.9380, vehicles: ['moto'], price_amount: 5000, price_currency: 'KHR', phone: null },
  { name: 'Sample: Car tire center near Olympic Stadium', lat: 11.5580, lng: 104.9120, vehicles: ['car'], price_amount: 5, price_currency: 'USD', phone: '023 555 234' },
  { name: 'Sample: Stall near Wat Phnom', lat: 11.5765, lng: 104.9235, vehicles: ['moto', 'tuktuk'], price_amount: 6000, price_currency: 'KHR', phone: null },
].map((shop) => ({ ...shop, is_sample: true }));

const { error: deleteError } = await supabase.from('spots').delete().eq('is_sample', true);
if (deleteError) {
  console.error('Removing old sample shops failed:', deleteError.message);
  process.exit(1);
}

const { error: insertError } = await supabase.from('spots').insert(SAMPLE_SHOPS);
if (insertError) {
  console.error('Inserting sample shops failed:', insertError.message);
  process.exit(1);
}

console.log(`Seeded ${SAMPLE_SHOPS.length} sample shops.`);
