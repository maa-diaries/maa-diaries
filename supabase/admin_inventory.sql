-- Run this once in Supabase SQL Editor before using stock and SKU fields.
alter table public.products add column if not exists stock integer not null default 0 check (stock >= 0);
alter table public.products add column if not exists sku text;
create unique index if not exists products_sku_unique on public.products(sku) where sku is not null;
