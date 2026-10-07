-- FlatFinder: run this once in the Supabase SQL editor.

create table if not exists public.spots (
  id             uuid primary key default gen_random_uuid(),
  name           text not null check (char_length(btrim(name)) between 1 and 100),
  lat            double precision not null check (lat between -90 and 90),
  lng            double precision not null check (lng between -180 and 180),
  vehicles       text[] not null
                   check (cardinality(vehicles) >= 1
                          and vehicles <@ array['moto','tuktuk','car']::text[]),
  price_amount   numeric check (price_amount is null or price_amount >= 0),
  price_currency text check (price_currency in ('KHR','USD')),
  is_sample      boolean not null default false,
  created_at     timestamptz not null default now(),
  constraint price_has_currency
    check ((price_amount is null) = (price_currency is null))
);

-- Lock the table to the public Supabase keys. Only our Express server,
-- using the server-side secret key, can read or write it.
alter table public.spots enable row level security;
