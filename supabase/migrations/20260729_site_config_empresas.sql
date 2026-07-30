-- Greentech Charge - Migration: Site Config em Empresas
-- Execute no SQL Editor do Supabase: https://supabase.com/dashboard/project/mhlpensdfcxvkwzkjguk/sql/new

ALTER TABLE public.empresas 
  ADD COLUMN IF NOT EXISTS whatsapp_responsavel text,
  ADD COLUMN IF NOT EXISTS site_portfolio jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS site_testimonials jsonb DEFAULT '[]'::jsonb;
