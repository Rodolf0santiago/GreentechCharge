'use server';

import fs from 'fs/promises';
import path from 'path';

// Caminho do arquivo JSON de dados
const DATA_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'landing-page-data.json');

// Interface para Projeto
export interface PortfolioProject {
  id: string;
  title: string;
  category: string;
  description: string;
  clientName: string;
  location: string;
  imageUrl: string;
}

// Interface para Depoimento
export interface Testimonial {
  id: string;
  clientName: string;
  role: string;
  comment: string;
  rating: number;
}

// Interface Geral
export interface LandingPageData {
  projects: PortfolioProject[];
  testimonials: Testimonial[];
}

const DEFAULT_DATA: LandingPageData = {
  projects: [
    {
      id: '1',
      title: 'Carport Solar Premium - Residencial',
      category: 'Solar + Carregamento',
      description: 'Instalação de carport solar com capacidade para 2 veículos elétricos e geração de 5.4 kWp para residência de alto padrão.',
      clientName: 'Carlos Eduardo',
      location: 'Florianópolis - SC',
      imageUrl: '/hero_carport_dusk.png'
    },
    {
      id: '2',
      title: 'Infraestrutura de Recarga Condominial',
      category: 'Greentech Charge',
      description: 'Projeto de adequação elétrica e instalação de 8 estações de recarga inteligente com sistema de gerenciamento de demanda dinâmico.',
      clientName: 'Condomínio Edifício Royal',
      location: 'Itajaí - SC',
      imageUrl: '/condo_ev_charging.png'
    }
  ],
  testimonials: [
    {
      id: '1',
      clientName: 'Mauro de Souza',
      role: 'Síndico do Condomínio Royal',
      comment: 'A Greentech Charge transformou nossa garagem. A instalação foi extremamente profissional, seguindo todas as normas de segurança e regras do bombeiro. O sistema de controle individualizado funciona perfeitamente.',
      rating: 5
    },
    {
      id: '2',
      clientName: 'Juliana Silveira',
      role: 'Proprietária de Veículo Elétrico',
      comment: 'Carregar meu carro com energia solar em casa é fantástico! A economia é absurda e o atendimento da equipe da Greentech superou todas as expectativas. Recomendo muito!',
      rating: 5
    }
  ]
};

/**
 * Obtém os dados da landing page (Portfólio e Depoimentos)
 */
export async function getLandingPageData(): Promise<LandingPageData> {
  try {
    const fileContent = await fs.readFile(DATA_FILE_PATH, 'utf-8');
    return JSON.parse(fileContent) as LandingPageData;
  } catch (err) {
    console.warn('Arquivo landing-page-data.json não encontrado ou inválido, usando dados padrão:', err);
    // Tentar criar o arquivo com os dados padrão para futuras chamadas
    try {
      await fs.mkdir(path.dirname(DATA_FILE_PATH), { recursive: true });
      await fs.writeFile(DATA_FILE_PATH, JSON.stringify(DEFAULT_DATA, null, 2), 'utf-8');
    } catch (writeErr) {
      console.error('Erro ao escrever arquivo de dados padrão:', writeErr);
    }
    return DEFAULT_DATA;
  }
}

/**
 * Salva os dados da landing page
 */
export async function saveLandingPageData(data: LandingPageData): Promise<{ success: boolean; error?: string }> {
  try {
    if (!data || !Array.isArray(data.projects) || !Array.isArray(data.testimonials)) {
      return { success: false, error: 'Estrutura de dados inválida.' };
    }
    
    // Garantir que o diretório exista
    await fs.mkdir(path.dirname(DATA_FILE_PATH), { recursive: true });
    await fs.writeFile(DATA_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
    return { success: true };
  } catch (err: any) {
    console.error('Erro ao salvar dados da landing page:', err);
    return { success: false, error: err.message || 'Erro ao gravar os dados.' };
  }
}
