-- Migration segura para adicionar colunas de endereço e CEP na tabela 'leads'
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'endereco_obra') THEN
    ALTER TABLE public.leads ADD COLUMN endereco_obra TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'cep') THEN
    ALTER TABLE public.leads ADD COLUMN cep TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'numero') THEN
    ALTER TABLE public.leads ADD COLUMN numero TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'tipo_servico') THEN
    ALTER TABLE public.leads ADD COLUMN tipo_servico TEXT;
  END IF;
END $$;
