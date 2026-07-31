-- Greentech Charge - Migration: Parceiros no Site
ALTER TABLE public.empresas 
  ADD COLUMN IF NOT EXISTS site_partners jsonb DEFAULT '[]'::jsonb;
