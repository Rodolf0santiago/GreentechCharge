'use server';

import { createServerClient } from '@/lib/supabase';
import { cookies } from 'next/headers';

// Helper de segurança para validar se o requisitante é super_admin ativo
async function checkSuperAdminPermission(supabaseAdmin: ReturnType<typeof createServerClient>) {
  const cookieStore = await cookies();
  const token = cookieStore.get('sb-access-token')?.value;

  if (!token) {
    throw new Error('Não autorizado: Sessão ausente.');
  }

  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
  if (authError || !user) {
    throw new Error('Não autorizado: Sessão inválida.');
  }

  const { data: profile } = await supabaseAdmin
    .from('perfis_usuarios')
    .select('role, status_acesso')
    .eq('id', user.id)
    .maybeSingle();

  const userRole = profile?.role || user.user_metadata?.role || user.app_metadata?.role;

  if (userRole !== 'super_admin') {
    throw new Error('Acesso negado: Permissão restrita ao proprietário do SaaS.');
  }

  if (profile?.status_acesso === false) {
    throw new Error('Acesso negado: Seu usuário está bloqueado.');
  }

  return user;
}

interface CriarEmpresaEClienteParams {
  nome_fantasia: string;
  cnpj: string;
  nome_mestre: string;
  email: string;
  password?: string;
}

/**
 * Cria a empresa na tabela empresas e o usuário administrador 'mestre' no auth.users, vinculando-os.
 */
export async function criarEmpresaECliente(dados: CriarEmpresaEClienteParams) {
  try {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return {
        success: false,
        error: 'Chave SUPABASE_SERVICE_ROLE_KEY ausente. Defina-a para gerenciar a autenticação admin.'
      };
    }

    const supabaseAdmin = createServerClient();
    await checkSuperAdminPermission(supabaseAdmin);

    if (!dados.nome_fantasia.trim()) return { success: false, error: 'O nome fantasia é obrigatório.' };
    if (!dados.cnpj.trim()) return { success: false, error: 'O CNPJ é obrigatório.' };
    if (!dados.nome_mestre.trim()) return { success: false, error: 'O nome do usuário responsável é obrigatório.' };
    if (!dados.email.trim()) return { success: false, error: 'O e-mail é obrigatório.' };

    const emailFormatado = dados.email.trim().toLowerCase();
    const cnpjFormatado = dados.cnpj.replace(/\D/g, '');
    const senhaDefinida = dados.password?.trim() || 'HublyMestre2026!';

    // 1. Verificar se o CNPJ já está cadastrado
    const { data: cnpjExists } = await supabaseAdmin
      .from('empresas')
      .select('id')
      .eq('cnpj', cnpjFormatado)
      .maybeSingle();

    if (cnpjExists) {
      return { success: false, error: 'Este CNPJ já está cadastrado.' };
    }

    // 2. Criar a empresa no banco de dados
    const { data: novaEmpresa, error: empresaError } = await supabaseAdmin
      .from('empresas')
      .insert({
        nome_fantasia: dados.nome_fantasia.trim(),
        cnpj: cnpjFormatado,
        status_assinatura: 'ativa'
      })
      .select()
      .single();

    if (empresaError || !novaEmpresa) {
      console.error('Erro ao criar empresa:', empresaError);
      return { success: false, error: empresaError?.message || 'Erro ao criar registro da empresa.' };
    }

    // 3. Criar o usuário responsável no Supabase Auth
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: emailFormatado,
      password: senhaDefinida,
      email_confirm: true,
      user_metadata: {
        name: dados.nome_mestre.trim(),
        nome_completo: dados.nome_mestre.trim(),
        role: 'mestre',
        status_acesso: true,
        empresa_id: novaEmpresa.id
      }
    });

    if (authError) {
      console.error('Erro ao criar usuário mestre no Auth:', authError);
      // Rollback da empresa criada
      await supabaseAdmin.from('empresas').delete().eq('id', novaEmpresa.id);
      return { success: false, error: authError.message || 'Erro ao criar conta de acesso do mestre.' };
    }

    const novoUserId = authUser.user?.id;
    if (!novoUserId) {
      await supabaseAdmin.from('empresas').delete().eq('id', novaEmpresa.id);
      return { success: false, error: 'Erro ao gerar o ID de usuário no Supabase.' };
    }

    // 4. Garantir que o perfil global foi criado em perfis_usuarios
    const { data: perfilExistente } = await supabaseAdmin
      .from('perfis_usuarios')
      .select('id')
      .eq('id', novoUserId)
      .maybeSingle();

    if (!perfilExistente) {
      const { error: profileError } = await supabaseAdmin
        .from('perfis_usuarios')
        .insert({
          id: novoUserId,
          nome_completo: dados.nome_mestre.trim(),
          email: emailFormatado,
          role: 'mestre',
          status_acesso: true,
          empresa_id: novaEmpresa.id,
          senha_temp: senhaDefinida
        });

      if (profileError) {
        console.error('Erro ao criar perfil mestre:', profileError);
        await supabaseAdmin.auth.admin.deleteUser(novoUserId);
        await supabaseAdmin.from('empresas').delete().eq('id', novaEmpresa.id);
        return { success: false, error: 'Erro ao criar o perfil do usuário responsável.' };
      }
    } else {
      // Atualizar o perfil caso já tenha sido criado pelo trigger handle_new_user
      await supabaseAdmin
        .from('perfis_usuarios')
        .update({
          nome_completo: dados.nome_mestre.trim(),
          role: 'mestre',
          empresa_id: novaEmpresa.id,
          status_acesso: true,
          senha_temp: senhaDefinida
        })
        .eq('id', novoUserId);
    }

    // 5. Criar (ou garantir) o vínculo em empresa_membros (N:N)
    //    O trigger handle_new_user já deve ter criado, mas garantimos aqui por segurança.
    const { error: membroError } = await supabaseAdmin
      .from('empresa_membros')
      .upsert({
        user_id:      novoUserId,
        empresa_id:   novaEmpresa.id,
        role:         'mestre',
        status_acesso: true,
      }, { onConflict: 'user_id,empresa_id' });

    if (membroError) {
      console.warn('[criarEmpresaECliente] Aviso: erro ao criar empresa_membros:', membroError.message);
      // Não é fatal — o trigger já pode ter criado
    }

    return {
      success: true,
      data: {
        empresa: novaEmpresa,
        usuarioId: novoUserId
      }
    };
  } catch (err: any) {
    console.error('Erro no criarEmpresaECliente:', err);
    return { success: false, error: err.message || 'Erro inesperado ao criar empresa e cliente.' };
  }
}

/**
 * Altera a senha de qualquer usuário usando o Supabase Auth Admin.
 */
export async function atualizarSenhaUsuario(userId: string, novaSenha: string) {
  try {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return { success: false, error: 'Chave SUPABASE_SERVICE_ROLE_KEY ausente.' };
    }

    const supabaseAdmin = createServerClient();
    await checkSuperAdminPermission(supabaseAdmin);

    if (!novaSenha || novaSenha.trim().length < 6) {
      return { success: false, error: 'A senha deve conter no mínimo 6 caracteres.' };
    }

    const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: novaSenha.trim()
    });

    if (error) {
      console.error('Erro ao alterar senha do usuário:', error);
      return { success: false, error: error.message || 'Erro ao redefinir a senha do usuário.' };
    }

    // Salvar nova senha limpa no perfil público para visualização pelo super admin
    await supabaseAdmin
      .from('perfis_usuarios')
      .update({ senha_temp: novaSenha.trim() })
      .eq('id', userId);

    return { success: true };
  } catch (err: any) {
    console.error('Erro no atualizarSenhaUsuario:', err);
    return { success: false, error: err.message || 'Erro inesperado ao alterar a senha.' };
  }
}

/**
 * Altera o status da assinatura de uma empresa no banco de dados.
 */
export async function alterarStatusAssinatura(empresaId: string, status: 'ativa' | 'inadimplente' | 'cancelada') {
  try {
    const supabaseAdmin = createServerClient();
    await checkSuperAdminPermission(supabaseAdmin);

    const { error } = await supabaseAdmin
      .from('empresas')
      .update({ status_assinatura: status })
      .eq('id', empresaId);

    if (error) {
      console.error('Erro ao atualizar status da assinatura:', error);
      return { success: false, error: error.message || 'Erro ao alterar o status da assinatura.' };
    }

    return { success: true };
  } catch (err: any) {
    console.error('Erro no alterarStatusAssinatura:', err);
    return { success: false, error: err.message || 'Erro inesperado ao atualizar a assinatura.' };
  }
}

/**
 * Retorna todas as empresas cadastradas no sistema, o usuário mestre e algumas métricas básicas de uso.
 */
export async function getSaaSEmpresas() {
  try {
    const supabaseAdmin = createServerClient();
    await checkSuperAdminPermission(supabaseAdmin);

    // 1. Buscar todas as empresas
    const { data: empresas, error: empresasError } = await supabaseAdmin
      .from('empresas')
      .select('*')
      .order('criado_em', { ascending: false });

    if (empresasError) {
      throw empresasError;
    }

    // 2. Para cada empresa, buscar o usuário com a role 'mestre' e contar registros
    const empresasComMetricas = await Promise.all(
      empresas.map(async (empresa) => {
        let mestre: { id: string; nome: string; email: string; senha_temp?: string } | null = null;

        // A. Buscar em perfis_usuarios por empresa_id (mestre ou admin)
        const { data: pMestre } = await supabaseAdmin
          .from('perfis_usuarios')
          .select('id, nome_completo, email, senha_temp, role')
          .eq('empresa_id', empresa.id)
          .in('role', ['mestre', 'admin'])
          .limit(1)
          .maybeSingle();

        if (pMestre) {
          mestre = {
            id: pMestre.id,
            nome: pMestre.nome_completo || pMestre.email,
            email: pMestre.email,
            senha_temp: pMestre.senha_temp
          };
        } else {
          // B. Buscar qualquer perfil vinculado a esta empresa (excluindo super_admin)
          const { data: pQualquer } = await supabaseAdmin
            .from('perfis_usuarios')
            .select('id, nome_completo, email, senha_temp')
            .eq('empresa_id', empresa.id)
            .neq('role', 'super_admin')
            .limit(1)
            .maybeSingle();

          if (pQualquer) {
            mestre = {
              id: pQualquer.id,
              nome: pQualquer.nome_completo || pQualquer.email,
              email: pQualquer.email,
              senha_temp: pQualquer.senha_temp
            };
          }
        }

        // Contar leads
        const { count: leadsCount } = await supabaseAdmin
          .from('leads')
          .select('*', { count: 'exact', head: true })
          .eq('empresa_id', empresa.id);

        // Contar projetos
        const { count: projectsCount } = await supabaseAdmin
          .from('projects')
          .select('*', { count: 'exact', head: true })
          .eq('empresa_id', empresa.id);

        return {
          ...empresa,
          mestre,
          metricas: {
            leads: leadsCount || 0,
            projetos: projectsCount || 0
          }
        };
      })
    );

    return { success: true, data: empresasComMetricas };
  } catch (err: any) {
    console.error('Erro no getSaaSEmpresas:', err);
    return { success: false, error: err.message || 'Erro inesperado ao listar empresas.' };
  }
}

interface VincularMestreParams {
  empresaId: string;
  email: string;
  nome: string;
  password?: string;
}

/**
 * Cria ou vincula a conta de um usuário responsável 'mestre' a uma empresa.
 */
export async function vincularOuCriarMestreEmpresa(params: VincularMestreParams) {
  try {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return { success: false, error: 'Chave SUPABASE_SERVICE_ROLE_KEY ausente.' };
    }

    const supabaseAdmin = createServerClient();
    await checkSuperAdminPermission(supabaseAdmin);

    if (!params.email?.trim()) return { success: false, error: 'O e-mail é obrigatório.' };
    if (!params.nome?.trim()) return { success: false, error: 'O nome é obrigatório.' };

    const emailFormatado = params.email.trim().toLowerCase();
    const senhaDefinida = params.password?.trim() || 'HublyMestre2026!';

    // Verificar se o usuário já existe no Auth pelo e-mail
    const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
    let existingUser = users?.find(u => u.email?.toLowerCase() === emailFormatado);

    let userId: string;

    if (existingUser) {
      userId = existingUser.id;
      const { error: updateAuthErr } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        password: senhaDefinida,
        user_metadata: {
          ...existingUser.user_metadata,
          name: params.nome.trim(),
          nome_completo: params.nome.trim(),
          role: 'mestre',
          status_acesso: true,
          empresa_id: params.empresaId
        }
      });

      if (updateAuthErr) {
        console.error('Erro ao atualizar usuário no Auth:', updateAuthErr);
        return { success: false, error: updateAuthErr.message };
      }
    } else {
      const { data: newAuthUser, error: createAuthErr } = await supabaseAdmin.auth.admin.createUser({
        email: emailFormatado,
        password: senhaDefinida,
        email_confirm: true,
        user_metadata: {
          name: params.nome.trim(),
          nome_completo: params.nome.trim(),
          role: 'mestre',
          status_acesso: true,
          empresa_id: params.empresaId
        }
      });

      if (createAuthErr || !newAuthUser.user) {
        console.error('Erro ao criar usuário mestre no Auth:', createAuthErr);
        return { success: false, error: createAuthErr?.message || 'Erro ao criar conta no Supabase Auth.' };
      }

      userId = newAuthUser.user.id;
    }

    // Upsert no perfis_usuarios
    const { error: profileError } = await supabaseAdmin
      .from('perfis_usuarios')
      .upsert({
        id: userId,
        nome_completo: params.nome.trim(),
        email: emailFormatado,
        role: 'mestre',
        status_acesso: true,
        empresa_id: params.empresaId,
        senha_temp: senhaDefinida
      }, { onConflict: 'id' });

    if (profileError) {
      console.error('Erro no upsert de perfis_usuarios:', profileError);
      return { success: false, error: profileError.message };
    }

    // Upsert em empresa_membros se a tabela existir
    try {
      await supabaseAdmin
        .from('empresa_membros')
        .upsert({
          user_id: userId,
          empresa_id: params.empresaId,
          role: 'mestre',
          status_acesso: true,
        }, { onConflict: 'user_id,empresa_id' });
    } catch (e) {}

    return {
      success: true,
      data: {
        userId,
        email: emailFormatado,
        senha: senhaDefinida
      }
    };
  } catch (err: any) {
    console.error('Erro no vincularOuCriarMestreEmpresa:', err);
    return { success: false, error: err.message || 'Erro ao vincular/criar usuário mestre.' };
  }
}

interface AtualizarEmpresaParams {
  nome_fantasia: string;
  cnpj: string;
}

/**
 * Atualiza os dados cadastrais de uma empresa (nome fantasia e CNPJ).
 */
export async function atualizarEmpresa(empresaId: string, dados: AtualizarEmpresaParams) {
  try {
    const supabaseAdmin = createServerClient();
    await checkSuperAdminPermission(supabaseAdmin);

    if (!dados.nome_fantasia.trim()) return { success: false, error: 'O nome fantasia é obrigatório.' };
    if (!dados.cnpj.trim()) return { success: false, error: 'O CNPJ é obrigatório.' };

    const cnpjFormatado = dados.cnpj.replace(/\D/g, '');

    // Verificar se outro cadastro já possui esse CNPJ
    const { data: cnpjExists } = await supabaseAdmin
      .from('empresas')
      .select('id')
      .eq('cnpj', cnpjFormatado)
      .neq('id', empresaId)
      .maybeSingle();

    if (cnpjExists) {
      return { success: false, error: 'Este CNPJ já está cadastrado em outra empresa.' };
    }

    const { error } = await supabaseAdmin
      .from('empresas')
      .update({
        nome_fantasia: dados.nome_fantasia.trim(),
        cnpj: cnpjFormatado,
      })
      .eq('id', empresaId);

    if (error) {
      console.error('Erro ao atualizar empresa:', error);
      return { success: false, error: error.message || 'Erro ao atualizar dados da empresa.' };
    }

    return { success: true };
  } catch (err: any) {
    console.error('Erro no atualizarEmpresa:', err);
    return { success: false, error: err.message || 'Erro inesperado ao atualizar a empresa.' };
  }
}

/**
 * Alterna manualmente o status da assinatura de uma empresa para bloqueio/desbloqueio.
 */
export async function alternarBloqueioEmpresa(
  empresaId: string,
  novoStatus: 'ativa' | 'inadimplente' | 'cancelada'
) {
  try {
    const supabaseAdmin = createServerClient();
    await checkSuperAdminPermission(supabaseAdmin);

    const { error } = await supabaseAdmin
      .from('empresas')
      .update({ status_assinatura: novoStatus })
      .eq('id', empresaId);

    if (error) {
      console.error('Erro ao alternar bloqueio da empresa:', error);
      return { success: false, error: error.message || 'Erro ao alterar status da assinatura.' };
    }

    return { success: true };
  } catch (err: any) {
    console.error('Erro no alternarBloqueioEmpresa:', err);
    return { success: false, error: err.message || 'Erro inesperado ao alternar bloqueio.' };
  }
}

interface SalvarFaturamentoCustomizadoParams {
  mensalidade_customizada: number | null;
  desconto_mensal: number;
  motivo_desconto: string | null;
}

/**
 * Define ou remove o valor da mensalidade personalizada e descontos para uma empresa.
 */
export async function salvarFaturamentoCustomizado(
  empresaId: string,
  dados: SalvarFaturamentoCustomizadoParams
) {
  try {
    const supabaseAdmin = createServerClient();
    await checkSuperAdminPermission(supabaseAdmin);

    const { error } = await supabaseAdmin
      .from('empresas')
      .update({
        mensalidade_customizada: dados.mensalidade_customizada,
        desconto_mensal: dados.desconto_mensal,
        motivo_desconto: dados.motivo_desconto || null
      })
      .eq('id', empresaId);

    if (error) {
      console.error('Erro ao salvar faturamento customizado:', error);
      return { success: false, error: error.message || 'Erro ao atualizar faturamento da empresa.' };
    }

    return { success: true };
  } catch (err: any) {
    console.error('Erro no salvarFaturamentoCustomizado:', err);
    return { success: false, error: err.message || 'Erro inesperado ao salvar faturamento.' };
  }
}

/**
 * Exclui permanentemente uma empresa com DEEP CLEANSE completo:
 *   1. Apaga todos os arquivos físicos do Supabase Storage (PDFs, imagens)
 *   2. Remove registros em tabelas filhas (faturas, visits, projects, leads, etc.)
 *   3. Desvincula ou apaga usuários associados do auth.users respeitando N:N
 *   4. Deleta o registro final da empresa
 */
export async function excluirEmpresa(empresaId: string) {
  try {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return { 
        success: false, 
        error: 'Chave SUPABASE_SERVICE_ROLE_KEY ausente no arquivo .env. Configure SUPABASE_SERVICE_ROLE_KEY para permitir exclusões via admin.' 
      };
    }

    const supabaseAdmin = createServerClient();
    await checkSuperAdminPermission(supabaseAdmin);

    // ─── PASSO 1: Limpar Supabase Storage (PDFs, imagens) ─────────────────────
    const BUCKET = 'documentos_crm';

    try {
      const { data: storageFiles } = await supabaseAdmin.storage
        .from(BUCKET)
        .list(empresaId, { limit: 1000, sortBy: { column: 'name', order: 'asc' } });

      if (storageFiles && storageFiles.length > 0) {
        const filePaths = storageFiles.map((f) => `${empresaId}/${f.name}`);
        const { error: removeError } = await supabaseAdmin.storage
          .from(BUCKET)
          .remove(filePaths);
        if (removeError) {
          console.warn(`[Deep Cleanse] Aviso ao remover arquivos do Storage (prefixo):`, removeError.message);
        } else {
          console.log(`[Deep Cleanse] ${filePaths.length} arquivo(s) removido(s) do Storage (prefixo).`);
        }
      }
    } catch (storageErr: any) {
      console.warn('[Deep Cleanse] Aviso na listagem do Storage por prefixo:', storageErr?.message);
    }

    try {
      const { data: visitsWithPdf } = await supabaseAdmin
        .from('visits')
        .select('pdf_proposta_url')
        .eq('empresa_id', empresaId)
        .not('pdf_proposta_url', 'is', null);

      if (visitsWithPdf && visitsWithPdf.length > 0) {
        const avulsePaths: string[] = visitsWithPdf
          .map((v) => {
            const url: string = v.pdf_proposta_url || '';
            const marker = `/object/public/${BUCKET}/`;
            const idx = url.indexOf(marker);
            return idx !== -1 ? decodeURIComponent(url.substring(idx + marker.length)) : null;
          })
          .filter((p): p is string => !!p && !p.startsWith(`${empresaId}/`));

        if (avulsePaths.length > 0) {
          const { error: avulseErr } = await supabaseAdmin.storage
            .from(BUCKET)
            .remove(avulsePaths);
          if (avulseErr) {
            console.warn('[Deep Cleanse] Aviso ao remover arquivos avulsos:', avulseErr.message);
          } else {
            console.log(`[Deep Cleanse] ${avulsePaths.length} arquivo(s) avulso(s) removido(s).`);
          }
        }
      }
    } catch (pdfErr: any) {
      console.warn('[Deep Cleanse] Aviso ao varrer pdf_proposta_url:', pdfErr?.message);
    }

    // ─── PASSO 2: Limpeza manual de dados em tabelas dependentes ───
    try { await supabaseAdmin.from('faturas').delete().eq('empresa_id', empresaId); } catch (e) {}
    try { await supabaseAdmin.from('gdrive_config').delete().eq('empresa_id', empresaId); } catch (e) {}
    try { await supabaseAdmin.from('tipos_servico').delete().eq('empresa_id', empresaId); } catch (e) {}
    try { await supabaseAdmin.from('whatsapp_config').delete().eq('empresa_id', empresaId); } catch (e) {}
    try { await supabaseAdmin.from('materiais_predefinidos').delete().eq('empresa_id', empresaId); } catch (e) {}
    try { await supabaseAdmin.from('visits').delete().eq('empresa_id', empresaId); } catch (e) {}
    try { await supabaseAdmin.from('projects').delete().eq('empresa_id', empresaId); } catch (e) {}
    try { await supabaseAdmin.from('leads').delete().eq('empresa_id', empresaId); } catch (e) {}
    try { await supabaseAdmin.from('responsaveis_tecnicos').delete().eq('empresa_id', empresaId); } catch (e) {}

    // ─── PASSO 3: Coletar e remover usuários vinculados ───
    const candidateUserIds = new Set<string>();

    // 3A. Tentar buscar em empresa_membros (se a tabela existir no banco)
    try {
      const { data: membros } = await supabaseAdmin
        .from('empresa_membros')
        .select('user_id')
        .eq('empresa_id', empresaId);
      if (membros) {
        membros.forEach(m => { if (m.user_id) candidateUserIds.add(m.user_id); });
      }
    } catch (e) {
      console.warn('[Deep Cleanse] Aviso ao consultar empresa_membros:', e);
    }

    // 3B. Tentar buscar em perfis_usuarios
    try {
      const { data: perfis } = await supabaseAdmin
        .from('perfis_usuarios')
        .select('id, role')
        .eq('empresa_id', empresaId);
      if (perfis) {
        perfis.forEach(p => {
          if (p.id && p.role !== 'super_admin') candidateUserIds.add(p.id);
        });
      }
    } catch (e) {
      console.warn('[Deep Cleanse] Aviso ao consultar perfis_usuarios:', e);
    }

    // Remover da tabela pivô se existir
    try {
      await supabaseAdmin.from('empresa_membros').delete().eq('empresa_id', empresaId);
    } catch (e) {}

    // Processar cada usuário candidato
    for (const userId of candidateUserIds) {
      let isSuperAdmin = false;
      try {
        const { data: pData } = await supabaseAdmin
          .from('perfis_usuarios')
          .select('role')
          .eq('id', userId)
          .maybeSingle();
        if (pData?.role === 'super_admin') isSuperAdmin = true;
      } catch (e) {}

      if (isSuperAdmin) {
        try {
          await supabaseAdmin.from('perfis_usuarios').update({ empresa_id: null }).eq('id', userId);
        } catch (e) {}
        continue;
      }

      let possuiOutrasEmpresas = false;

      // Verificar se possui outras empresas em empresa_membros
      try {
        const { count } = await supabaseAdmin
          .from('empresa_membros')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId);
        if ((count ?? 0) > 0) possuiOutrasEmpresas = true;
      } catch (e) {}

      // Verificar se possui outra empresa em perfis_usuarios
      try {
        const { count } = await supabaseAdmin
          .from('perfis_usuarios')
          .select('*', { count: 'exact', head: true })
          .eq('id', userId)
          .neq('empresa_id', empresaId);
        if ((count ?? 0) > 0) possuiOutrasEmpresas = true;
      } catch (e) {}

      if (!possuiOutrasEmpresas) {
        console.log(`[Deep Cleanse] Deletando usuário exclusivo do Auth/Perfis: ${userId}`);
        try { await supabaseAdmin.from('perfis_usuarios').delete().eq('id', userId); } catch (e) {}
        try {
          const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);
          if (authDeleteError) {
            console.warn(`[Deep Cleanse] Aviso ao deletar usuário do Auth (${userId}):`, authDeleteError.message);
          }
        } catch (e) {
          console.warn(`[Deep Cleanse] Erro ao deletar do Auth:`, e);
        }
      } else {
        console.log(`[Deep Cleanse] Usuário ${userId} pertence a outra empresa — mantendo usuário e desvinculando.`);
        try {
          await supabaseAdmin.from('perfis_usuarios').update({ empresa_id: null }).eq('id', userId).eq('empresa_id', empresaId);
        } catch (e) {}
      }
    }

    // ─── PASSO 4: Deletar o registro da empresa no banco de dados ────
    const { error: empresaDeleteError } = await supabaseAdmin
      .from('empresas')
      .delete()
      .eq('id', empresaId);

    if (empresaDeleteError) {
      console.error('[Deep Cleanse] Erro ao deletar empresa:', empresaDeleteError);
      return { success: false, error: `Erro ao deletar empresa: ${empresaDeleteError.message}` };
    }

    console.log(`[Deep Cleanse] ✅ Empresa ${empresaId} e todos os seus dados foram eliminados com sucesso.`);
    return { success: true };
  } catch (err: any) {
    console.error('[Deep Cleanse] Erro inesperado no excluirEmpresa:', err);
    return { success: false, error: err.message || 'Erro inesperado ao excluir empresa.' };
  }
}
