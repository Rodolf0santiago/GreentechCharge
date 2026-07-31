'use server';

import { createServerClient } from '@/lib/supabase';
import { cookies } from 'next/headers';
import fs from 'fs/promises';
import path from 'path';

const DATA_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'landing-page-data.json');

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

export interface PartnerLogo {
  id: string;
  name: string;
  logoUrl: string;
  websiteUrl?: string;
}

export const DEFAULT_PARTNERS: PartnerLogo[] = [
  {
    id: '1',
    name: 'Bosch Service',
    logoUrl: '/partners/bosch.svg',
  },
  {
    id: '2',
    name: 'JBS',
    logoUrl: '/partners/jbs.svg',
  },
];

export interface ConfigSite {
  empresa_id: string;
  nome_fantasia: string;
  cnpj: string;
  whatsapp_responsavel: string | null;
  regiao_atendimento: string;
  instagram_handle: string;
  site_portfolio: PortfolioProject[];
  site_testimonials: Testimonial[];
  site_partners: PartnerLogo[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function getEmpresaIdFromSession(): Promise<string | null> {
  const supabase = createServerClient();
  try {
    const cookieStore = await cookies();
    const token =
      cookieStore.get('sb-access-token')?.value ||
      cookieStore.get('sb-auth-token')?.value;

    if (token) {
      const {
        data: { user },
      } = await supabase.auth.getUser(token);

      if (user) {
        // Busca empresa_id do perfil (tabela perfis_usuarios)
        const { data: profile } = await supabase
          .from('perfis_usuarios')
          .select('empresa_id')
          .eq('id', user.id)
          .single();

        if (profile?.empresa_id) {
          return profile.empresa_id;
        }
      }
    }
  } catch (err) {
    console.warn('[getEmpresaIdFromSession] Aviso ao verificar sessão do cookie:', err);
  }

  // Fallback: busca a primeira empresa ativa no banco de dados (produto single-tenant)
  try {
    const { data: firstEmpresa } = await supabase
      .from('empresas')
      .select('id')
      .neq('status_assinatura', 'cancelada')
      .order('criado_em', { ascending: true })
      .limit(1)
      .maybeSingle();

    return firstEmpresa?.id ?? null;
  } catch (e) {
    return null;
  }
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

    // Tentar carregar partners do arquivo JSON local como fallback prioritário se necessário
    let localFilePartners: PartnerLogo[] = [];
    try {
      const fileContent = await fs.readFile(DATA_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(fileContent);
      if (Array.isArray(parsed.partners) && parsed.partners.length > 0) {
        localFilePartners = parsed.partners;
      }
    } catch {}

    const supabase = createServerClient();

    // Tenta buscar com colunas novas; se a migration ainda não foi aplicada, usa fallback
    const { data: fullData, error: fullError } = await supabase
      .from('empresas')
      .select('id, nome_fantasia, cnpj, whatsapp_responsavel, regiao_atendimento, instagram_handle, site_portfolio, site_testimonials, site_partners')
      .eq('id', empresaId)
      .single();

    let data: any = fullData;

    if (fullError) {
      // Fallback: migration ainda não aplicada — busca apenas colunas base
      const { data: baseData, error: baseError } = await supabase
        .from('empresas')
        .select('id, nome_fantasia, cnpj')
        .eq('id', empresaId)
        .single();

      if (baseError || !baseData) {
        console.error('[getConfigSite] Erro ao buscar empresa (fallback):', baseError);
        return { success: false, error: 'Empresa não encontrada.' };
      }
      data = {
        ...baseData,
        whatsapp_responsavel: null,
        regiao_atendimento: 'Florianópolis e Região',
        instagram_handle: '@greentechcharge',
        site_portfolio: [],
        site_testimonials: [],
        site_partners: localFilePartners.length > 0 ? localFilePartners : DEFAULT_PARTNERS,
      };
    }

    const partners = Array.isArray(data.site_partners) && data.site_partners.length > 0
      ? (data.site_partners as PartnerLogo[])
      : localFilePartners.length > 0
      ? localFilePartners
      : DEFAULT_PARTNERS;

    return {
      success: true,
      data: {
        empresa_id: data.id,
        nome_fantasia: data.nome_fantasia ?? '',
        cnpj: data.cnpj ?? '',
        whatsapp_responsavel: data.whatsapp_responsavel ?? null,
        regiao_atendimento: data.regiao_atendimento ?? 'Florianópolis e Região',
        instagram_handle: data.instagram_handle ?? '@greentechcharge',
        site_portfolio: (data.site_portfolio as PortfolioProject[]) ?? [],
        site_testimonials: (data.site_testimonials as Testimonial[]) ?? [],
        site_partners: partners,
      },
    };
  } catch (err: any) {
    console.error('[getConfigSite] Erro inesperado:', err);
    return { success: false, error: err.message || 'Erro inesperado.' };
  }
}

/**
 * Salva dados cadastrais da empresa (nome, cnpj, whatsapp, região, instagram).
 */
export async function saveDadosEmpresa(dados: {
  nome_fantasia?: string;
  cnpj?: string;
  whatsapp_responsavel?: string;
  regiao_atendimento?: string;
  instagram_handle?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const empresaId = await getEmpresaIdFromSession();
    if (!empresaId) {
      return { success: false, error: 'Sessão não encontrada.' };
    }

    const nome = typeof dados?.nome_fantasia === 'string' && dados.nome_fantasia.trim()
      ? dados.nome_fantasia.trim()
      : 'Greentech Charge';

    const cnpjClean = typeof dados?.cnpj === 'string'
      ? dados.cnpj.replace(/\D/g, '')
      : '';

    const wppClean = typeof dados?.whatsapp_responsavel === 'string'
      ? dados.whatsapp_responsavel.replace(/\D/g, '')
      : '';

    const regiaoClean = typeof dados?.regiao_atendimento === 'string' && dados.regiao_atendimento.trim()
      ? dados.regiao_atendimento.trim()
      : 'Florianópolis e Região';

    const instaClean = typeof dados?.instagram_handle === 'string' && dados.instagram_handle.trim()
      ? dados.instagram_handle.trim()
      : '@greentechcharge';

    const supabase = createServerClient();
    const updatePayload: any = {
      nome_fantasia: nome,
      cnpj: cnpjClean,
      whatsapp_responsavel: wppClean || null,
      regiao_atendimento: regiaoClean,
      instagram_handle: instaClean,
    };

    const { error } = await supabase
      .from('empresas')
      .update(updatePayload)
      .eq('id', empresaId);

    if (error) {
      console.warn('[saveDadosEmpresa] Erro Supabase:', error.message);
      // Se colunas opcionais ainda não existirem no DB, tenta atualizar apenas colunas base
      if (error.code === 'PGRST204' || error.message?.includes('column')) {
        const { error: retryErr } = await supabase
          .from('empresas')
          .update({
            nome_fantasia: nome,
            cnpj: cnpjClean,
          })
          .eq('id', empresaId);

        if (retryErr) {
          console.error('[saveDadosEmpresa] Erro no retry:', retryErr);
          return { success: false, error: retryErr.message || 'Erro ao salvar dados.' };
        }
      } else {
        return { success: false, error: error.message || 'Erro ao salvar dados da empresa.' };
      }
    }

    return { success: true };
  } catch (err: any) {
    console.error('[saveDadosEmpresa] Erro inesperado:', err);
    return { success: false, error: err.message || 'Erro inesperado.' };
  }
}

/**
 * Salva portfólio, depoimentos e parceiros do site da empresa.
 */
export async function saveSiteContent(dados: {
  portfolio: PortfolioProject[];
  testimonials: Testimonial[];
  partners?: PartnerLogo[];
}): Promise<{ success: boolean; error?: string }> {
  try {
    const empresaId = await getEmpresaIdFromSession();
    if (!empresaId) {
      return { success: false, error: 'Sessão não encontrada.' };
    }

    if (!Array.isArray(dados.portfolio) || !Array.isArray(dados.testimonials)) {
      return { success: false, error: 'Estrutura de dados inválida.' };
    }

    // 1. Gravar arquivo JSON local para persistência garantida
    try {
      await fs.mkdir(path.dirname(DATA_FILE_PATH), { recursive: true });
      await fs.writeFile(
        DATA_FILE_PATH,
        JSON.stringify(
          {
            projects: dados.portfolio,
            testimonials: dados.testimonials,
            partners: dados.partners || [],
          },
          null,
          2
        ),
        'utf-8'
      );
    } catch (fsErr) {
      console.warn('[saveSiteContent] Erro ao gravar JSON local:', fsErr);
    }

    // 2. Tentar atualizar banco de dados Supabase
    const supabase = createServerClient();
    const updatePayload: any = {
      site_portfolio: dados.portfolio,
      site_testimonials: dados.testimonials,
    };
    if (dados.partners && Array.isArray(dados.partners)) {
      updatePayload.site_partners = dados.partners;
    }

    const { error } = await supabase
      .from('empresas')
      .update(updatePayload)
      .eq('id', empresaId);

    if (error) {
      console.warn('[saveSiteContent] Erro Supabase:', error.message);
      // Se a coluna site_partners ainda não foi criada na migration do Supabase, tenta atualizar sem essa coluna
      if (error.message?.includes('site_partners') || error.code === 'PGRST204') {
        delete updatePayload.site_partners;
        await supabase
          .from('empresas')
          .update(updatePayload)
          .eq('id', empresaId);
      }
    }

    return { success: true };
  } catch (err: any) {
    console.error('[saveSiteContent] Erro inesperado:', err);
    return { success: false, error: err.message || 'Erro inesperado.' };
  }
}
