'use server';

import { createServerClient } from '@/lib/supabase';
import { cookies } from 'next/headers';

export interface MinhaEmpresa {
  empresa_id: string;
  nome_fantasia: string;
  role: 'admin' | 'instalador' | 'tecnico' | 'mestre' | 'vendedor';
  status_acesso: boolean;
  status_assinatura: string;
}

/**
 * Retorna todas as empresas às quais o usuário autenticado pertence.
 * Usado na tela de seleção de empresa após o login.
 */
/**
 * Retorna todas as empresas às quais o usuário autenticado pertence.
 * Usado na tela de seleção de empresa após o login.
 */
export async function getMinhasEmpresas(): Promise<{
  success: boolean;
  data?: MinhaEmpresa[];
  error?: string;
}> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('sb-access-token')?.value;
    if (!token) {
      return { success: false, error: 'Sessão não encontrada.' };
    }

    const supabaseAdmin = createServerClient();
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      return { success: false, error: 'Sessão inválida.' };
    }

    // 1. Tentar busca via RPC get_user_empresas (N:N em empresa_membros)
    try {
      const { data, error } = await supabaseAdmin.rpc('get_user_empresas', {
        p_user_id: user.id,
      });

      if (!error && data && Array.isArray(data) && data.length > 0) {
        return { success: true, data: data as MinhaEmpresa[] };
      }
    } catch (e) {
      console.warn('[getMinhasEmpresas] RPC get_user_empresas não disponível, executando fallback:', e);
    }

    // 2. Tentar buscar em empresa_membros diretamente
    try {
      const { data: membros } = await supabaseAdmin
        .from('empresa_membros')
        .select('role, status_acesso, empresas(id, nome_fantasia, status_assinatura)')
        .eq('user_id', user.id);

      if (membros && membros.length > 0) {
        const result: MinhaEmpresa[] = membros.map((m: any) => ({
          empresa_id: m.empresas?.id,
          nome_fantasia: m.empresas?.nome_fantasia || 'Minha Empresa',
          role: m.role,
          status_acesso: m.status_acesso,
          status_assinatura: m.empresas?.status_assinatura || 'ativa',
        })).filter(e => !!e.empresa_id);

        if (result.length > 0) {
          return { success: true, data: result };
        }
      }
    } catch (e) {
      console.warn('[getMinhasEmpresas] Tabela empresa_membros inacessível:', e);
    }

    // 3. Fallback definitivo: consultar perfis_usuarios + tabela empresas
    const { data: perfil } = await supabaseAdmin
      .from('perfis_usuarios')
      .select('empresa_id, role, status_acesso')
      .eq('id', user.id)
      .maybeSingle();

    const empId = perfil?.empresa_id || user.user_metadata?.empresa_id;
    const userRole = perfil?.role || user.user_metadata?.role || 'mestre';

    if (empId) {
      const { data: empresa } = await supabaseAdmin
        .from('empresas')
        .select('id, nome_fantasia, status_assinatura')
        .eq('id', empId)
        .maybeSingle();

      if (empresa) {
        return {
          success: true,
          data: [{
            empresa_id: empresa.id,
            nome_fantasia: empresa.nome_fantasia,
            role: userRole as any,
            status_acesso: perfil?.status_acesso ?? true,
            status_assinatura: empresa.status_assinatura || 'ativa'
          }]
        };
      }
    }

    return { success: true, data: [] };
  } catch (err: any) {
    console.error('[getMinhasEmpresas] Erro inesperado:', err);
    return { success: false, error: err.message || 'Erro inesperado.' };
  }
}

/**
 * Valida que o usuário pertence à empresa solicitada e injeta empresa_id + role
 * nos metadados do JWT via Auth Admin.
 */
export async function selecionarEmpresa(empresaId: string): Promise<{
  success: boolean;
  role?: string;
  nome_fantasia?: string;
  error?: string;
}> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('sb-access-token')?.value;
    if (!token) {
      return { success: false, error: 'Sessão não encontrada.' };
    }

    const supabaseAdmin = createServerClient();
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      return { success: false, error: 'Sessão inválida.' };
    }

    let role = 'mestre';
    let status_acesso = true;
    let nome_fantasia = 'Empresa';

    // 1. Tentar verificar via empresa_membros
    try {
      const { data: membro } = await supabaseAdmin
        .from('empresa_membros')
        .select('role, status_acesso, empresas(id, nome_fantasia, status_assinatura)')
        .eq('user_id', user.id)
        .eq('empresa_id', empresaId)
        .maybeSingle();

      if (membro) {
        role = membro.role;
        status_acesso = membro.status_acesso;
        const emp = membro.empresas as any;
        if (emp?.nome_fantasia) nome_fantasia = emp.nome_fantasia;
        if (emp?.status_assinatura === 'cancelada') {
          return { success: false, error: 'Esta empresa está com a assinatura cancelada.' };
        }
      } else {
        // Fallback via perfis_usuarios / empresas
        const { data: perfil } = await supabaseAdmin
          .from('perfis_usuarios')
          .select('role, status_acesso')
          .eq('id', user.id)
          .maybeSingle();

        if (perfil) {
          role = perfil.role;
          status_acesso = perfil.status_acesso ?? true;
        }
      }
    } catch (e) {
      console.warn('[selecionarEmpresa] Fallback ativado:', e);
    }

    if (!status_acesso) {
      return { success: false, error: 'Seu acesso a esta empresa está bloqueado.' };
    }

    // 2. Injetar empresa_id e role no user_metadata do Auth
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      user_metadata: {
        ...user.user_metadata,
        empresa_id: empresaId,
        role: role,
        status_acesso: status_acesso,
        name: user.user_metadata?.name || user.user_metadata?.nome_completo,
        nome_completo: user.user_metadata?.nome_completo || user.user_metadata?.name,
      },
    });

    if (updateError) {
      console.error('[selecionarEmpresa] Erro ao atualizar metadata do Auth:', updateError);
      return { success: false, error: 'Erro ao ativar a empresa selecionada.' };
    }

    // Sincronizar perfis_usuarios
    try {
      await supabaseAdmin
        .from('perfis_usuarios')
        .update({ empresa_id: empresaId, role })
        .eq('id', user.id);
    } catch (e) {}

    return {
      success: true,
      role,
      nome_fantasia
    };
  } catch (err: any) {
    console.error('[selecionarEmpresa] Erro inesperado:', err);
    return { success: false, error: err.message || 'Erro inesperado ao selecionar empresa.' };
  }
}
      role: membro.role,
      nome_fantasia: empresa?.nome_fantasia,
    };
  } catch (err: any) {
    console.error('[selecionarEmpresa] Erro inesperado:', err);
    return { success: false, error: err.message || 'Erro inesperado.' };
  }
}
