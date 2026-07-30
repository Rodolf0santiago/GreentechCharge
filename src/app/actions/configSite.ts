'use server';

import { createServerClient } from '@/lib/supabase';
import { cookies } from 'next/headers';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface PortfolioProject {
  id: string;
  title: string;
  category: string;
  description: string;
  clientName: string;
  location: string;
  imageUrl: string;
  images?: string[];
}

export interface Testimonial {
  id: string;
  clientName: string;
  role: string;
  comment: string;
  rating: number;
  avatarUrl?: string;
}

export interface ConfigSite {
  empresa_id: string;
  nome_fantasia: string;
  cnpj: string;
  whatsapp_responsavel: string | null;
  site_portfolio: PortfolioProject[];
  site_testimonials: Testimonial[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function getEmpresaIdFromSession(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('sb-access-token')?.value;
  if (!token) return null;

  const supabase = createServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);
  if (error || !user) return null;

  // Busca empresa_id do perfil (tabela perfis_usuarios)
  const { data: profile } = await supabase
    .from('perfis_usuarios')
    .select('empresa_id')
    .eq('id', user.id)
    .single();

  if (profile?.empresa_id) {
    return profile.empresa_id;
  }

  // Fallback: busca a primeira empresa no banco de dados (produto single-tenant)
  const { data: firstEmpresa } = await supabase
    .from('empresas')
    .select('id')
    .limit(1)
    .maybeSingle();

  return firstEmpresa?.id ?? null;
}

// ─── Actions ─────────────────────────────────────────────────────────────────

/**
 * Retorna as configurações do site da empresa autenticada.
 */
export async function getConfigSite(): Promise<{
  success: boolean;
  data?: ConfigSite;
  error?: string;
}> {
  try {
    const empresaId = await getEmpresaIdFromSession();
    if (!empresaId) {
      return { success: false, error: 'Sessão não encontrada ou empresa não selecionada.' };
    }

    const supabase = createServerClient();

    // Tenta buscar com colunas novas; se a migration ainda não foi aplicada, usa fallback
    const { data: fullData, error: fullError } = await supabase
      .from('empresas')
      .select('id, nome_fantasia, cnpj, whatsapp_responsavel, site_portfolio, site_testimonials')
      .eq('id', empresaId)
      .single();

    let data: any = fullData;

    if (fullError) {
      // Fallback: migration ainda não aplicada — busca apenas colunas base
      const isMissingColumn =
        fullError.message?.includes('whatsapp_responsavel') ||
        fullError.message?.includes('site_portfolio') ||
        fullError.message?.includes('site_testimonials') ||
        fullError.code === '42703';

      if (isMissingColumn) {
        const { data: baseData, error: baseError } = await supabase
          .from('empresas')
          .select('id, nome_fantasia, cnpj')
          .eq('id', empresaId)
          .single();

        if (baseError || !baseData) {
          console.error('[getConfigSite] Erro ao buscar empresa (fallback):', baseError);
          return { success: false, error: 'Empresa não encontrada.' };
        }
        data = { ...baseData, whatsapp_responsavel: null, site_portfolio: [], site_testimonials: [] };
      } else {
        console.error('[getConfigSite] Erro ao buscar empresa:', fullError);
        return { success: false, error: 'Empresa não encontrada.' };
      }
    }

    return {
      success: true,
      data: {
        empresa_id: data.id,
        nome_fantasia: data.nome_fantasia ?? '',
        cnpj: data.cnpj ?? '',
        whatsapp_responsavel: data.whatsapp_responsavel ?? null,
        site_portfolio: (data.site_portfolio as PortfolioProject[]) ?? [],
        site_testimonials: (data.site_testimonials as Testimonial[]) ?? [],
      },
    };
  } catch (err: any) {
    console.error('[getConfigSite] Erro inesperado:', err);
    return { success: false, error: err.message || 'Erro inesperado.' };
  }
}

/**
 * Salva dados cadastrais da empresa (nome, cnpj, whatsapp).
 */
export async function saveDadosEmpresa(dados: {
  nome_fantasia: string;
  cnpj: string;
  whatsapp_responsavel: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const empresaId = await getEmpresaIdFromSession();
    if (!empresaId) {
      return { success: false, error: 'Sessão não encontrada.' };
    }

    if (!dados.nome_fantasia?.trim()) {
      return { success: false, error: 'Nome fantasia é obrigatório.' };
    }

    const supabase = createServerClient();
    const { error } = await supabase
      .from('empresas')
      .update({
        nome_fantasia: dados.nome_fantasia.trim(),
        cnpj: dados.cnpj.replace(/\D/g, ''),
        whatsapp_responsavel: dados.whatsapp_responsavel.replace(/\D/g, '') || null,
      })
      .eq('id', empresaId);

    if (error) {
      console.error('[saveDadosEmpresa] Erro:', error);
      return { success: false, error: error.message || 'Erro ao salvar dados da empresa.' };
    }

    return { success: true };
  } catch (err: any) {
    console.error('[saveDadosEmpresa] Erro inesperado:', err);
    return { success: false, error: err.message || 'Erro inesperado.' };
  }
}

/**
 * Salva portfólio e depoimentos do site da empresa.
 */
export async function saveSiteContent(dados: {
  portfolio: PortfolioProject[];
  testimonials: Testimonial[];
}): Promise<{ success: boolean; error?: string }> {
  try {
    const empresaId = await getEmpresaIdFromSession();
    if (!empresaId) {
      return { success: false, error: 'Sessão não encontrada.' };
    }

    if (!Array.isArray(dados.portfolio) || !Array.isArray(dados.testimonials)) {
      return { success: false, error: 'Estrutura de dados inválida.' };
    }

    const supabase = createServerClient();
    const { error } = await supabase
      .from('empresas')
      .update({
        site_portfolio: dados.portfolio,
        site_testimonials: dados.testimonials,
      })
      .eq('id', empresaId);

    if (error) {
      console.error('[saveSiteContent] Erro:', error);
      return { success: false, error: error.message || 'Erro ao salvar conteúdo do site.' };
    }

    return { success: true };
  } catch (err: any) {
    console.error('[saveSiteContent] Erro inesperado:', err);
    return { success: false, error: err.message || 'Erro inesperado.' };
  }
}
