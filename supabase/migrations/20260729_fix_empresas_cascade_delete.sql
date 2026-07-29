-- ============================================================================
-- OKKA Platform / Greentech Charge - Migration Safe: Deep Cleanse & Cascade Delete
-- 
-- Execute este script no SQL Editor do Supabase. Ele verifica com segurança
-- a existência de cada tabela antes de aplicar o ON DELETE CASCADE.
-- ============================================================================

DO $$
DECLARE
  tbl text;
  tables text[] := ARRAY[
    'perfis_usuarios',
    'empresa_membros',
    'leads',
    'projects',
    'visits',
    'responsaveis_tecnicos',
    'whatsapp_config',
    'materiais_predefinidos',
    'tipos_servico',
    'gdrive_config',
    'faturas'
  ];
BEGIN
  FOREACH tbl IN ARRAY tables LOOP
    -- Verifica se a tabela existe no esquema public
    IF EXISTS (
      SELECT 1 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name = tbl
    ) THEN
      -- Remover constraints antigas de empresa_id se existirem
      EXECUTE format('
        ALTER TABLE public.%I 
        DROP CONSTRAINT IF EXISTS %I_empresa_id_fkey,
        DROP CONSTRAINT IF EXISTS fk_%I_empresa;
      ', tbl, tbl, tbl);

      -- Adiciona a constraint ON DELETE CASCADE apenas se a coluna empresa_id existir
      IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = tbl 
          AND column_name = 'empresa_id'
      ) THEN
        EXECUTE format('
          ALTER TABLE public.%I 
          ADD CONSTRAINT %I_empresa_id_fkey 
          FOREIGN KEY (empresa_id) REFERENCES public.empresas(id) 
          ON DELETE CASCADE;
        ', tbl, tbl);
        RAISE NOTICE 'Constraint ON DELETE CASCADE configurada para a tabela public.%', tbl;
      END IF;
    ELSE
      RAISE NOTICE 'Tabela public.% não existe no banco (pulada com segurança).', tbl;
    END IF;
  END LOOP;
END $$;
