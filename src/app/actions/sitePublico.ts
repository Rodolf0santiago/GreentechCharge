'use server';

import { createServerClient } from '@/lib/supabase';

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

export interface DadosPublicosSite {
  nome_fantasia: string;
  cnpj: string;
  whatsapp_responsavel: string | null;
  site_portfolio: PortfolioProject[];
  site_testimonials: Testimonial[];
}

/**
 * Retorna dados públicos do site da empresa para exibição na landing page.
 * Busca a primeira empresa ativa (produto single-tenant: Greentech Charge).
 * Não requer autenticação.
 */
export async function getDadosPublicosSite(): Promise<DadosPublicosSite> {
  const DEFAULT: DadosPublicosSite = {
    nome_fantasia: 'Greentech Charge',
    cnpj: '',
    whatsapp_responsavel: '5548991948635',
    site_portfolio: [
      {
        id: '1',
        title: 'Carport Solar Premium - Residencial',
        category: 'Solar + Carregamento',
        description:
          'Instalação de carport solar com capacidade para 2 veículos elétricos e geração de 5.4 kWp para residência de alto padrão.',
        clientName: 'Carlos Eduardo',
        location: 'Florianópolis - SC',
        imageUrl: '/hero_carport_dusk.png',
      },
      {
        id: '2',
        title: 'Infraestrutura de Recarga Condominial',
        category: 'Greentech Charge',
        description:
          'Projeto de adequação elétrica e instalação de 8 estações de recarga inteligente com sistema de gerenciamento de demanda dinâmico.',
        clientName: 'Condomínio Edifício Royal',
        location: 'Itajaí - SC',
        imageUrl: '/condo_ev_charging.png',
      },
    ],
    site_testimonials: [
      {
        id: '1',
        clientName: 'Mauro de Souza',
        role: 'Síndico do Condomínio Royal',
        comment:
          'A Greentech Charge transformou nossa garagem. A instalação foi extremamente profissional, seguindo todas as normas de segurança e regras do bombeiro.',
        rating: 5,
      },
      {
        id: '2',
        clientName: 'Juliana Silveira',
        role: 'Proprietária de Veículo Elétrico',
        comment:
          'Carregar meu carro com energia solar em casa é fantástico! A economia é absurda e o atendimento da equipe da Greentech superou todas as expectativas. Recomendo muito!',
        rating: 5,
      },
    ],
  };

  try {
    const supabase = createServerClient();

    // Busca a primeira empresa ativa (produto single-tenant)
    const { data, error } = await supabase
      .from('empresas')
      .select('nome_fantasia, cnpj, whatsapp_responsavel, site_portfolio, site_testimonials')
      .neq('status_assinatura', 'cancelada')
      .order('criado_em', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      console.warn('[getDadosPublicosSite] Usando dados padrão:', error?.message);
      return DEFAULT;
    }

    const portfolio = Array.isArray(data.site_portfolio) && data.site_portfolio.length > 0
      ? (data.site_portfolio as PortfolioProject[])
      : DEFAULT.site_portfolio;

    const testimonials = Array.isArray(data.site_testimonials) && data.site_testimonials.length > 0
      ? (data.site_testimonials as Testimonial[])
      : DEFAULT.site_testimonials;

    return {
      nome_fantasia: data.nome_fantasia ?? DEFAULT.nome_fantasia,
      cnpj: data.cnpj ?? '',
      whatsapp_responsavel: data.whatsapp_responsavel ?? DEFAULT.whatsapp_responsavel,
      site_portfolio: portfolio,
      site_testimonials: testimonials,
    };
  } catch (err: any) {
    console.error('[getDadosPublicosSite] Erro inesperado:', err);
    return DEFAULT;
  }
}
