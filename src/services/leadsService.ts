import { supabase } from '@/lib/supabase';
import { Lead } from '@/types/database.types';

export const leadsService = {
  /**
   * Cria um novo lead (chamado pela Landing Page)
   */
  async createLead(lead: {
    nome: string;
    email: string | null;
    telefone: string;
    cidade: string;
    area_m2: number | null;
    endereco_obra?: string | null;
    valor_estimado?: number | null;
    materiais_previstos?: any[] | null;
    observacoes?: string | null;
    status?: Lead['status'];
    cep?: string | null;
    numero?: string | null;
    tipo_servico?: string | null;
    empresa_id?: string | null;
  }): Promise<Lead> {
    // Tentar inferir o empresa_id da sessão ativa do usuário logado
    let empresaId = lead.empresa_id;
    if (!empresaId) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.user_metadata?.empresa_id) {
          empresaId = session.user.user_metadata.empresa_id;
        }
      } catch (e) {}
    }

    const baseData: any = {
      nome: lead.nome,
      email: lead.email,
      telefone: lead.telefone,
      cidade: lead.cidade,
      area_m2: lead.area_m2,
      valor_estimado: lead.valor_estimado || 0,
      materiais_previstos: lead.materiais_previstos || [],
      observacoes: lead.observacoes || null,
      status: lead.status || 'Novo',
      ...(empresaId && { empresa_id: empresaId }),
    };

    // 1. Tentar inserção completa com endereco_obra, cep, numero, tipo_servico
    const payloadCompleto: any = {
      ...baseData,
      endereco_obra: lead.endereco_obra || null,
      cep: lead.cep || null,
      numero: lead.numero || null,
      tipo_servico: lead.tipo_servico || null,
    };

    const { data, error } = await supabase
      .from('leads')
      .insert([payloadCompleto])
      .select()
      .single();

    if (!error && data) {
      return data;
    }

    console.warn('[leadsService] Erro ao inserir lead com payload completo:', error?.message);

    // 2. Se falhar por causa da coluna 'endereco_obra', tentar com a coluna 'endereco'
    if (error?.message?.includes('endereco_obra') || error?.message?.includes('schema cache')) {
      const payloadComEndereco = {
        ...baseData,
        endereco: lead.endereco_obra || null,
        cep: lead.cep || null,
        numero: lead.numero || null,
        tipo_servico: lead.tipo_servico || null,
      };

      const { data: data2, error: error2 } = await supabase
        .from('leads')
        .insert([payloadComEndereco])
        .select()
        .single();

      if (!error2 && data2) {
        return data2;
      }

      console.warn('[leadsService] Erro ao inserir com coluna "endereco":', error2?.message);

      // 3. Fallback de alta resiliência: tentar apenas com colunas essenciais existentes no banco
      const payloadEssencial = {
        ...baseData,
        cidade: lead.cidade,
        ...(lead.endereco_obra ? { observacoes: `Endereço: ${lead.endereco_obra}${lead.cep ? ` | CEP: ${lead.cep}` : ''}${lead.tipo_servico ? ` | Serviço: ${lead.tipo_servico}` : ''}` } : {}),
      };

      const { data: data3, error: error3 } = await supabase
        .from('leads')
        .insert([payloadEssencial])
        .select()
        .single();

      if (!error3 && data3) {
        return data3;
      }

      throw new Error(error3?.message || error2?.message || error?.message || 'Erro ao salvar o lead.');
    }

    throw new Error(error?.message || 'Erro ao salvar o lead.');
  },

  /**
   * Obtém todos os leads (chamado pelo CRM)
   */
  async getLeads(): Promise<Lead[]> {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('criado_em', { ascending: false });

    if (error) {
      throw new Error(error.message || 'Erro ao buscar leads.');
    }
    return data || [];
  },

  /**
   * Atualiza o status de um lead
   */
  async updateLeadStatus(id: string, status: Lead['status']): Promise<Lead> {
    const { data, error } = await supabase
      .from('leads')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message || 'Erro ao atualizar status do lead.');
    }
    return data;
  },

  /**
   * Atualiza um lead por completo
   */
  async updateLead(id: string, updates: Partial<Lead>): Promise<Lead> {
    const { data, error } = await supabase
      .from('leads')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message || 'Erro ao atualizar o lead.');
    }
    return data;
  },

  /**
   * Exclui um lead pelo ID
   */
  async deleteLead(id: string): Promise<void> {
    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(error.message || 'Erro ao excluir o lead.');
    }
  },
};
