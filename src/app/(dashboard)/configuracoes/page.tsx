'use client';

import React, { useState, useEffect } from 'react';
import {
  getWhatsappConfig,
  saveWhatsappConfig,
  testWhatsappSend,
  triggerManualCheck,
} from '@/app/actions/whatsapp';
import { WhatsappConfig } from '@/types/database.types';
import {
  getConfigSite,
  saveDadosEmpresa,
  PortfolioProject,
  Testimonial,
} from '@/app/actions/configSite';
import LandingPageSettingsEditor from '@/components/crm/landing-page-settings-editor';

type SettingsTab = 'empresa' | 'landingPage' | 'whatsapp';

export default function ConfiguracoesPage() {
  // ─── Tab ────────────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<SettingsTab>('empresa');

  // ─── Toast ──────────────────────────────────────────────────────────────────
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4500);
  };

  // ─── Loading ─────────────────────────────────────────────────────────────────
  const [isLoading, setIsLoading] = useState(true);

  // ─── Empresa / Site Config ───────────────────────────────────────────────────
  const [nomeFantasia, setNomeFantasia] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [whatsappResponsavel, setWhatsappResponsavel] = useState('');
  const [regiaoAtendimento, setRegiaoAtendimento] = useState('');
  const [instagramHandle, setInstagramHandle] = useState('');
  const [isSavingEmpresa, setIsSavingEmpresa] = useState(false);

  // ─── Landing Page ────────────────────────────────────────────────────────────
  const [portfolio, setPortfolio] = useState<PortfolioProject[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  // ─── WhatsApp Notificações ───────────────────────────────────────────────────
  const [config, setConfig] = useState<WhatsappConfig | null>(null);
  const [ativo, setAtivo] = useState(false);
  const [apiProvider, setApiProvider] = useState<'evolution' | 'zapi' | 'custom'>('evolution');
  const [apiUrl, setApiUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [instancia, setInstancia] = useState('');
  const [antecedenciaMinutos, setAntecedenciaMinutos] = useState(60);
  const [mensagemTemplate, setMensagemTemplate] = useState('');
  const [headersCustomizados, setHeadersCustomizados] = useState('');
  const [payloadCustomizado, setPayloadCustomizado] = useState('');
  const [isSavingWpp, setIsSavingWpp] = useState(false);

  const [testeTelefone, setTesteTelefone] = useState('');
  const [testeMensagem, setTesteMensagem] = useState(
    'Olá! Esta é uma mensagem de teste enviada através da integração WhatsApp do HUBLY PRO CRM.'
  );
  const [isTesting, setIsTesting] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  // ─── Load Data ───────────────────────────────────────────────────────────────
  useEffect(() => {
    async function loadAll() {
      try {
        // Carregar dados do site/empresa
        const siteRes = await getConfigSite();
        if (siteRes.success && siteRes.data) {
          setNomeFantasia(siteRes.data.nome_fantasia);
          setCnpj(formatCNPJ(siteRes.data.cnpj));
          setWhatsappResponsavel(formatPhone(siteRes.data.whatsapp_responsavel ?? ''));
          setRegiaoAtendimento(siteRes.data.regiao_atendimento || 'Florianópolis e Região');
          setInstagramHandle(siteRes.data.instagram_handle || '@greentechcharge');
          setPortfolio(siteRes.data.site_portfolio);
          setTestimonials(siteRes.data.site_testimonials);
        }

        // Carregar configurações de WhatsApp
        const wppData = await getWhatsappConfig();
        setConfig(wppData);
        setAtivo(wppData.ativo);
        setApiProvider(wppData.api_provider);
        setApiUrl(wppData.api_url || '');
        setApiKey(wppData.api_key || '');
        setInstancia(wppData.instancia || '');
        setAntecedenciaMinutos(wppData.antecedencia_minutos);
        setMensagemTemplate(wppData.mensagem_template);
        setHeadersCustomizados(wppData.headers_customizados || '');
        setPayloadCustomizado(wppData.payload_customizado || '');
      } catch (err: any) {
        showToast('Erro ao carregar configurações.', 'error');
      } finally {
        setIsLoading(false);
      }
    }
    loadAll();
  }, []);

  // ─── Formatters ──────────────────────────────────────────────────────────────
  const formatCNPJ = (v: string) => {
    const n = v.replace(/\D/g, '');
    if (n.length !== 14) return v;
    return n.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
  };

  const formatPhone = (v: string) => {
    if (!v) return '';
    const n = v.replace(/\D/g, '');
    if (n.length === 13) return n.replace(/^(\d{2})(\d{2})(\d{5})(\d{4})$/, '+$1 ($2) $3-$4');
    if (n.length === 11) return n.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
    return v;
  };

  // ─── Handlers — Empresa ──────────────────────────────────────────────────────
  const handleSaveEmpresa = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingEmpresa(true);
    try {
      const res = await saveDadosEmpresa({
        nome_fantasia: nomeFantasia,
        cnpj: cnpj,
        whatsapp_responsavel: whatsappResponsavel,
        regiao_atendimento: regiaoAtendimento,
        instagram_handle: instagramHandle,
      });
      if (res.success) {
        showToast('✅ Dados da empresa e redes do site atualizados com sucesso!', 'success');
      } else {
        showToast(res.error || 'Erro ao salvar dados da empresa.', 'error');
      }
    } catch {
      showToast('Erro de conexão ao salvar.', 'error');
    } finally {
      setIsSavingEmpresa(false);
    }
  };

  // ─── Handlers — WhatsApp Config ──────────────────────────────────────────────
  const handleSaveWpp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingWpp(true);

    if (apiProvider === 'custom') {
      if (headersCustomizados.trim()) {
        try { JSON.parse(headersCustomizados); }
        catch { showToast('Os cabeçalhos devem ser um JSON válido.', 'error'); setIsSavingWpp(false); return; }
      }
      if (payloadCustomizado.trim()) {
        try { JSON.parse(payloadCustomizado); }
        catch { showToast('O payload deve ser um JSON válido.', 'error'); setIsSavingWpp(false); return; }
      }
    }

    try {
      const res = await saveWhatsappConfig({
        ativo,
        api_provider: apiProvider,
        api_url: apiUrl.trim(),
        api_key: apiKey.trim(),
        instancia: instancia.trim(),
        antecedencia_minutos: Number(antecedenciaMinutos),
        mensagem_template: mensagemTemplate,
        headers_customizados: headersCustomizados.trim() || null,
        payload_customizado: payloadCustomizado.trim() || null,
      });

      if (res.success) {
        showToast('✅ Configurações salvas com sucesso!', 'success');
      } else {
        showToast(res.error || 'Erro ao salvar configurações.', 'error');
      }
    } catch {
      showToast('Erro de conexão ao salvar.', 'error');
    } finally {
      setIsSavingWpp(false);
    }
  };

  const handleTestSend = async () => {
    if (!testeTelefone.trim()) { showToast('Informe um número de telefone.', 'error'); return; }
    setIsTesting(true);
    try {
      const res = await testWhatsappSend(testeTelefone.trim(), testeMensagem);
      if (res.success) showToast('Mensagem de teste enviada!', 'success');
      else showToast(res.error || 'Erro no envio de teste.', 'error');
    } catch { showToast('Erro interno no envio de teste.', 'error'); }
    finally { setIsTesting(false); }
  };

  const handleTriggerCheck = async () => {
    setIsChecking(true);
    try {
      const res = await triggerManualCheck();
      if (res.success) {
        showToast(`Varredura concluída! ${res.sentCount} enviadas, ${res.skippedCount} ignoradas.`, 'success');
      } else {
        showToast(res.error || 'Erro ao processar notificações.', 'error');
      }
    } catch { showToast('Erro interno ao executar varredura.', 'error'); }
    finally { setIsChecking(false); }
  };

  // ─── Render ──────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-orange-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-sm text-gray-400 font-medium">Carregando configurações...</span>
        </div>
      </div>
    );
  }

  const labelClass = 'text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5 block';
  const inputClass =
    'w-full bg-gray-50 border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 rounded-xl px-4 py-2.5 text-gray-800 placeholder-gray-400 outline-none transition-all text-sm';
  const selectClass =
    'w-full bg-gray-50 border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 rounded-xl px-4 py-2.5 text-gray-800 outline-none transition-all text-sm cursor-pointer appearance-none';

  const tabs: { key: SettingsTab; label: string; emoji: string }[] = [
    { key: 'empresa', label: 'Dados da Empresa', emoji: '🏢' },
    { key: 'landingPage', label: 'Conteúdo do Site', emoji: '🌐' },
    { key: 'whatsapp', label: 'Notificações WhatsApp', emoji: '💬' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-6 md:p-10 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
              <span className="w-2.5 h-7 rounded-full bg-gradient-to-b from-orange-500 to-amber-500 inline-block shrink-0" />
              Configurações
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Gerencie os dados da empresa, o conteúdo do site público e as integrações do CRM.
            </p>
          </div>

          {activeTab === 'whatsapp' && (
            <button
              onClick={handleTriggerCheck}
              disabled={isChecking || !ativo}
              className="px-5 py-2.5 bg-orange-50 hover:bg-orange-100 disabled:opacity-40 disabled:cursor-not-allowed border border-orange-200 text-orange-600 rounded-xl font-bold text-sm transition-all flex items-center gap-2 cursor-pointer shadow-sm"
            >
              {isChecking ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Verificando...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H17" />
                  </svg>
                  Verificar e Notificar Agora
                </>
              )}
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 gap-1">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab.key
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              {tab.emoji} {tab.label}
            </button>
          ))}
        </div>

        {/* Toast */}
        {toast && (
          <div
            className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl transition-all duration-300 text-white text-sm font-bold ${
              toast.type === 'error' ? 'bg-rose-600 border border-rose-500' : 'bg-gray-900 border border-gray-800'
            }`}
          >
            {toast.type === 'error' ? (
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
            )}
            {toast.msg}
          </div>
        )}

        {/* ── TAB: DADOS DA EMPRESA ─────────────────────────────────────────── */}
        {activeTab === 'empresa' && (
          <form onSubmit={handleSaveEmpresa} className="space-y-6">

            {/* Card: Identidade */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-6">
              <h2 className="text-base font-bold text-gray-950 pb-3 border-b border-gray-100 flex items-center gap-2">
                <svg className="w-4.5 h-4.5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Identidade da Empresa
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1">
                  <label className={labelClass}>Nome Fantasia da Empresa</label>
                  <input
                    type="text"
                    value={nomeFantasia}
                    onChange={e => setNomeFantasia(e.target.value)}
                    placeholder="Ex: Greentech Charge"
                    className={inputClass}
                    required
                  />
                  <p className="text-[10px] text-gray-400">Exibido no cabeçalho e rodapé do site público.</p>
                </div>

                <div className="space-y-1">
                  <label className={labelClass}>CNPJ</label>
                  <input
                    type="text"
                    value={cnpj}
                    onChange={e => setCnpj(e.target.value)}
                    placeholder="Ex: 12.345.678/0001-90"
                    maxLength={18}
                    className={inputClass}
                  />
                  <p className="text-[10px] text-gray-400">Exibido no rodapé do site para credibilidade.</p>
                </div>
              </div>
            </div>

            {/* Card: Contato Público */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-6">
              <h2 className="text-base font-bold text-gray-950 pb-3 border-b border-gray-100 flex items-center gap-2">
                <svg className="w-4.5 h-4.5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Contato Público do Site
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1">
                  <label className={labelClass}>Região / Cidade de Atendimento</label>
                  <input
                    type="text"
                    value={regiaoAtendimento}
                    onChange={e => setRegiaoAtendimento(e.target.value)}
                    placeholder="Ex: Florianópolis e Região"
                    className={inputClass}
                  />
                  <p className="text-[10px] text-gray-400">Exibido na seção "Solicite seu Orçamento" do site público.</p>
                </div>

                <div className="space-y-1">
                  <label className={labelClass}>Instagram da Empresa</label>
                  <input
                    type="text"
                    value={instagramHandle}
                    onChange={e => setInstagramHandle(e.target.value)}
                    placeholder="Ex: @greentechcharge"
                    className={inputClass}
                  />
                  <p className="text-[10px] text-gray-400">Nome de usuário do Instagram exibido no site público.</p>
                </div>
              </div>

              <div className="space-y-1">
                <label className={labelClass}>
                  WhatsApp do Responsável{' '}
                  <span className="text-orange-500 normal-case font-normal">(botão flutuante no site)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">
                    +55
                  </span>
                  <input
                    type="text"
                    value={whatsappResponsavel}
                    onChange={e => setWhatsappResponsavel(e.target.value)}
                    placeholder="(48) 99194-8635"
                    className={`${inputClass} pl-12`}
                  />
                </div>
                <p className="text-[10px] text-gray-400">
                  Insira o número com DDD (Ex: 48991948635). O botão verde de WhatsApp do site usará este número.
                </p>
              </div>

              {/* Preview do botão */}
              {whatsappResponsavel && (
                <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-100 rounded-xl">
                  <div className="w-10 h-10 bg-[#A4E83C] rounded-full flex items-center justify-center shrink-0 shadow-md">
                    <svg className="w-5 h-5 text-neutral-800" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-green-800">Pré-visualização do botão flutuante</p>
                    <p className="text-[11px] text-green-700">
                      wa.me/{whatsappResponsavel.replace(/\D/g, '')}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSavingEmpresa}
                className="px-7 py-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl font-black text-sm transition-all shadow-md shadow-orange-500/20 cursor-pointer flex items-center gap-2"
              >
                {isSavingEmpresa ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Salvando...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                    Salvar Dados da Empresa
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* ── TAB: LANDING PAGE ─────────────────────────────────────────────── */}
        {activeTab === 'landingPage' && (
          <LandingPageSettingsEditor
            portfolio={portfolio}
            setPortfolio={setPortfolio}
            testimonials={testimonials}
            setTestimonials={setTestimonials}
            showToast={showToast}
          />
        )}

        {/* ── TAB: WHATSAPP NOTIFICAÇÕES ────────────────────────────────────── */}
        {activeTab === 'whatsapp' && (
          <>
            <form onSubmit={handleSaveWpp} className="space-y-6">

              {/* Ativação */}
              <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex items-center justify-between">
                <div className="space-y-1 pr-4">
                  <h2 className="text-base font-bold text-gray-900">Notificações Automáticas</h2>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Habilite o envio automático de mensagens de WhatsApp para os técnicos sobre visitas agendadas.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={ativo}
                    onChange={e => setAtivo(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-12 h-6.5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500" />
                </label>
              </div>

              {/* Credenciais */}
              <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-6">
                <h2 className="text-base font-bold text-gray-950 pb-3 border-b border-gray-100 flex items-center gap-2">
                  <svg className="w-4.5 h-4.5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                  Credenciais da API
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className={labelClass}>Provedor da API</label>
                    <div className="relative">
                      <select value={apiProvider} onChange={e => setApiProvider(e.target.value as any)} className={selectClass}>
                        <option value="evolution">Evolution API</option>
                        <option value="zapi">Z-API</option>
                        <option value="custom">POST HTTP Genérico</option>
                      </select>
                      <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className={labelClass}>Antecedência do Envio</label>
                    <div className="relative">
                      <select value={antecedenciaMinutos} onChange={e => setAntecedenciaMinutos(Number(e.target.value))} className={selectClass}>
                        <option value="30">30 Minutos antes</option>
                        <option value="60">1 Hora antes</option>
                        <option value="120">2 Horas antes</option>
                        <option value="180">3 Horas antes</option>
                        <option value="360">6 Horas antes</option>
                        <option value="720">12 Horas antes</option>
                        <option value="1440">24 Horas antes</option>
                      </select>
                      <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className={labelClass}>URL Base da API</label>
                  <input type="url" value={apiUrl} onChange={e => setApiUrl(e.target.value)} placeholder="https://sua-api.com" className={inputClass} required={ativo} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className={labelClass}>ApiKey / Token</label>
                    <input type="password" value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder="••••••••••••" className={inputClass} />
                  </div>
                  {apiProvider !== 'custom' && (
                    <div className="space-y-1">
                      <label className={labelClass}>Nome / ID da Instância</label>
                      <input type="text" value={instancia} onChange={e => setInstancia(e.target.value)} placeholder="MinhaInstancia" className={inputClass} required={ativo} />
                    </div>
                  )}
                </div>

                {apiProvider === 'custom' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className={labelClass}>Headers JSON</label>
                      <textarea rows={4} value={headersCustomizados} onChange={e => setHeadersCustomizados(e.target.value)} placeholder={'{\n  "Authorization": "Bearer TOKEN"\n}'} className={`${inputClass} font-mono text-xs`} />
                    </div>
                    <div className="space-y-1">
                      <label className={labelClass}>Payload JSON Template</label>
                      <textarea rows={4} value={payloadCustomizado} onChange={e => setPayloadCustomizado(e.target.value)} placeholder={'{\n  "to": "{phone}",\n  "text": "{message}"\n}'} className={`${inputClass} font-mono text-xs`} />
                    </div>
                  </div>
                )}
              </div>

              {/* Template */}
              <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-5">
                <h2 className="text-base font-bold text-gray-950 pb-3 border-b border-gray-100">Template da Mensagem</h2>
                <textarea rows={5} value={mensagemTemplate} onChange={e => setMensagemTemplate(e.target.value)} className={`${inputClass} resize-none leading-relaxed`} required />
                <div className="bg-orange-50/50 border border-orange-100 rounded-xl p-4 space-y-2">
                  <h4 className="text-xs font-bold text-orange-800 uppercase tracking-wider">Variáveis Disponíveis</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1.5 pt-1 text-[10px] font-mono text-orange-900">
                    <div>{'{nome_tecnico}'}</div><div>{'{cliente_nome}'}</div><div>{'{data_visita}'}</div>
                    <div>{'{horario_visita}'}</div><div>{'{endereco_obra}'}</div><div>{'{observacoes}'}</div>
                    <div className="col-span-2 sm:col-span-1">{'{antecedencia}'}</div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button type="submit" disabled={isSavingWpp} className="px-6 py-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl font-black text-sm transition-all shadow-md shadow-orange-500/20 cursor-pointer flex items-center gap-2">
                  {isSavingWpp ? (
                    <><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Salvando...</>
                  ) : (
                    <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>Salvar Integração</>
                  )}
                </button>
              </div>
            </form>

            {/* Teste */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-5">
              <h2 className="text-base font-bold text-gray-950 pb-3 border-b border-gray-100">Ferramenta de Teste</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1 sm:col-span-1">
                  <label className={labelClass}>Número do Celular</label>
                  <input type="text" value={testeTelefone} onChange={e => setTesteTelefone(e.target.value)} placeholder="41999991111" className={inputClass} />
                  <p className="text-[9px] text-gray-400">Só números, com DDD.</p>
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className={labelClass}>Mensagem do Teste</label>
                  <div className="flex gap-2">
                    <input type="text" value={testeMensagem} onChange={e => setTesteMensagem(e.target.value)} className={inputClass} />
                    <button type="button" onClick={handleTestSend} disabled={isTesting} className="px-5 bg-gray-900 hover:bg-black disabled:opacity-40 text-white rounded-xl font-bold text-xs shrink-0 transition-colors flex items-center gap-1.5 cursor-pointer">
                      {isTesting ? <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> : 'Disparar'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
