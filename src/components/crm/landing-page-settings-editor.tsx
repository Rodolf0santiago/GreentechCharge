'use client';

import React, { useState } from 'react';
import { saveSiteContent, PortfolioProject, Testimonial, PartnerLogo } from '@/app/actions/configSite';

interface LandingPageSettingsEditorProps {
  portfolio: PortfolioProject[];
  setPortfolio: React.Dispatch<React.SetStateAction<PortfolioProject[]>>;
  testimonials: Testimonial[];
  setTestimonials: React.Dispatch<React.SetStateAction<Testimonial[]>>;
  partners: PartnerLogo[];
  setPartners: React.Dispatch<React.SetStateAction<PartnerLogo[]>>;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

export default function LandingPageSettingsEditor({
  portfolio,
  setPortfolio,
  testimonials,
  setTestimonials,
  partners,
  setPartners,
  showToast,
}: LandingPageSettingsEditorProps) {
  const [isSaving, setIsSaving] = useState(false);

  // States for Project Form
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [projectTitle, setProjectTitle] = useState('');
  const [projectCategory, setProjectCategory] = useState('Geração Solar');
  const [projectDescription, setProjectDescription] = useState('');
  const [projectClient, setProjectClient] = useState('');
  const [projectLocation, setProjectLocation] = useState('');
  const [projectImageUrl, setProjectImageUrl] = useState('');
  const [imageMode, setImageMode] = useState<'preset' | 'url'>('preset');
  const [projectImagePreset, setProjectImagePreset] = useState('/hero_carport_dusk.png');
  const [showProjectForm, setShowProjectForm] = useState(false);

  // States for Testimonial Form
  const [editingTestimonialId, setEditingTestimonialId] = useState<string | null>(null);
  const [testClient, setTestClient] = useState('');
  const [testRole, setTestRole] = useState('');
  const [testComment, setTestComment] = useState('');
  const [testRating, setTestRating] = useState<number>(5);
  const [testAvatarUrl, setTestAvatarUrl] = useState('');
  const [showTestForm, setShowTestForm] = useState(false);

  // States for Partner Form
  const [editingPartnerId, setEditingPartnerId] = useState<string | null>(null);
  const [partnerName, setPartnerName] = useState('');
  const [partnerLogoUrl, setPartnerLogoUrl] = useState('');
  const [partnerLogoPreset, setPartnerLogoPreset] = useState('/partners/bosch.svg');
  const [partnerImageMode, setPartnerImageMode] = useState<'upload' | 'preset' | 'url'>('upload');
  const [partnerWebsiteUrl, setPartnerWebsiteUrl] = useState('');
  const [showPartnerForm, setShowPartnerForm] = useState(false);

  const getEffectiveImageUrl = () =>
    imageMode === 'url' ? projectImageUrl.trim() : projectImagePreset;

  // PROJECT ACTIONS
  const startAddProject = () => {
    setEditingProjectId(null);
    setProjectTitle('');
    setProjectCategory('Geração Solar');
    setProjectDescription('');
    setProjectClient('');
    setProjectLocation('');
    setProjectImageUrl('');
    setProjectImagePreset('/hero_carport_dusk.png');
    setImageMode('preset');
    setShowProjectForm(true);
  };

  const startEditProject = (proj: PortfolioProject) => {
    setEditingProjectId(proj.id);
    setProjectTitle(proj.title);
    setProjectCategory(proj.category);
    setProjectDescription(proj.description);
    setProjectClient(proj.clientName);
    setProjectLocation(proj.location);
    const isPreset = proj.imageUrl.startsWith('/');
    setImageMode(isPreset ? 'preset' : 'url');
    setProjectImagePreset(isPreset ? proj.imageUrl : '/hero_carport_dusk.png');
    setProjectImageUrl(isPreset ? '' : proj.imageUrl);
    setShowProjectForm(true);
  };

  const saveProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectTitle.trim()) {
      showToast('O título do projeto é obrigatório.', 'error');
      return;
    }
    const imageUrl = getEffectiveImageUrl();
    if (!imageUrl) {
      showToast('Selecione ou insira uma imagem para o projeto.', 'error');
      return;
    }

    if (editingProjectId) {
      setPortfolio(prev =>
        prev.map(p =>
          p.id === editingProjectId
            ? {
                ...p,
                title: projectTitle.trim(),
                category: projectCategory,
                description: projectDescription.trim(),
                clientName: projectClient.trim(),
                location: projectLocation.trim(),
                imageUrl,
              }
            : p
        )
      );
    } else {
      const newProj: PortfolioProject = {
        id: Date.now().toString(),
        title: projectTitle.trim(),
        category: projectCategory,
        description: projectDescription.trim(),
        clientName: projectClient.trim(),
        location: projectLocation.trim(),
        imageUrl,
      };
      setPortfolio(prev => [...prev, newProj]);
    }
    setShowProjectForm(false);
    setEditingProjectId(null);
  };

  const deleteProject = (id: string) => {
    if (confirm('Tem certeza que deseja remover este projeto da landing page?')) {
      setPortfolio(prev => prev.filter(p => p.id !== id));
    }
  };

  // TESTIMONIAL ACTIONS
  const startAddTestimonial = () => {
    setEditingTestimonialId(null);
    setTestClient('');
    setTestRole('');
    setTestComment('');
    setTestRating(5);
    setTestAvatarUrl('');
    setShowTestForm(true);
  };

  const startEditTestimonial = (test: Testimonial & { avatarUrl?: string }) => {
    setEditingTestimonialId(test.id);
    setTestClient(test.clientName);
    setTestRole(test.role);
    setTestComment(test.comment);
    setTestRating(test.rating);
    setTestAvatarUrl(test.avatarUrl || '');
    setShowTestForm(true);
  };

  const saveTestimonial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testClient.trim() || !testComment.trim()) {
      showToast('Nome do cliente e depoimento são obrigatórios.', 'error');
      return;
    }

    if (editingTestimonialId) {
      setTestimonials(prev =>
        prev.map(t =>
          t.id === editingTestimonialId
            ? {
                ...t,
                clientName: testClient.trim(),
                role: testRole.trim(),
                comment: testComment.trim(),
                rating: testRating,
                avatarUrl: testAvatarUrl.trim() || undefined,
              }
            : t
        )
      );
    } else {
      const newTest: Testimonial & { avatarUrl?: string } = {
        id: Date.now().toString(),
        clientName: testClient.trim(),
        role: testRole.trim(),
        comment: testComment.trim(),
        rating: testRating,
        avatarUrl: testAvatarUrl.trim() || undefined,
      };
      setTestimonials(prev => [...prev, newTest]);
    }
    setShowTestForm(false);
    setEditingTestimonialId(null);
  };

  const deleteTestimonial = (id: string) => {
    if (confirm('Tem certeza que deseja remover este depoimento da landing page?')) {
      setTestimonials(prev => prev.filter(t => t.id !== id));
    }
  };

  // PARTNER ACTIONS
  const getEffectivePartnerLogoUrl = () => {
    if (partnerImageMode === 'preset') return partnerLogoPreset;
    return partnerLogoUrl.trim();
  };

  const handlePartnerImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast('O arquivo de imagem deve ter no máximo 5MB.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setPartnerLogoUrl(dataUrl);
        setPartnerImageMode('upload');
      }
    };
    reader.readAsDataURL(file);
  };

  const startAddPartner = () => {
    setEditingPartnerId(null);
    setPartnerName('');
    setPartnerLogoUrl('');
    setPartnerLogoPreset('/partners/bosch.svg');
    setPartnerImageMode('upload');
    setPartnerWebsiteUrl('');
    setShowPartnerForm(true);
  };

  const startEditPartner = (p: PartnerLogo) => {
    setEditingPartnerId(p.id);
    setPartnerName(p.name);
    const isPreset = p.logoUrl.startsWith('/partners/');
    const isUrl = p.logoUrl.startsWith('http://') || p.logoUrl.startsWith('https://');
    if (isPreset) {
      setPartnerImageMode('preset');
      setPartnerLogoPreset(p.logoUrl);
      setPartnerLogoUrl('');
    } else if (isUrl) {
      setPartnerImageMode('url');
      setPartnerLogoUrl(p.logoUrl);
    } else {
      setPartnerImageMode('upload');
      setPartnerLogoUrl(p.logoUrl);
    }
    setPartnerWebsiteUrl(p.websiteUrl || '');
    setShowPartnerForm(true);
  };

  const savePartner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerName.trim()) {
      showToast('O nome do parceiro é obrigatório.', 'error');
      return;
    }
    const logoUrl = getEffectivePartnerLogoUrl();
    if (!logoUrl) {
      showToast('Selecione ou insira uma imagem de logomarca.', 'error');
      return;
    }

    if (editingPartnerId) {
      setPartners(prev =>
        prev.map(p =>
          p.id === editingPartnerId
            ? {
                ...p,
                name: partnerName.trim(),
                logoUrl,
                websiteUrl: partnerWebsiteUrl.trim() || undefined,
              }
            : p
        )
      );
    } else {
      const newPartner: PartnerLogo = {
        id: Date.now().toString(),
        name: partnerName.trim(),
        logoUrl,
        websiteUrl: partnerWebsiteUrl.trim() || undefined,
      };
      setPartners(prev => [...prev, newPartner]);
    }
    setShowPartnerForm(false);
    setEditingPartnerId(null);
  };

  const deletePartner = (id: string) => {
    if (confirm('Tem certeza que deseja remover esta logomarca de parceiro do site?')) {
      setPartners(prev => prev.filter(p => p.id !== id));
    }
  };

  // SAVE ALL TO SUPABASE
  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      const res = await saveSiteContent({
        portfolio,
        testimonials,
        partners,
      });

      if (res.success) {
        showToast('✅ Site atualizado com sucesso! As mudanças já estão ativas na página pública.', 'success');
      } else {
        showToast(res.error || 'Erro ao publicar dados no site.', 'error');
      }
    } catch {
      showToast('Erro de conexão ao salvar dados do site.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const labelClass = 'text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5 block';
  const inputClass =
    'w-full bg-gray-50 border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 rounded-xl px-4 py-2.5 text-gray-800 placeholder-gray-400 outline-none transition-all text-sm';
  const selectClass =
    'w-full bg-gray-50 border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 rounded-xl px-4 py-2.5 text-gray-800 outline-none transition-all text-sm cursor-pointer';

  return (
    <div className="space-y-8 pb-16">

      {/* Save Button Header */}
      <div className="bg-orange-50 border border-orange-100 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1">
          <h2 className="text-base font-bold text-orange-950">Publicar Alterações no Site</h2>
          <p className="text-xs text-orange-700 leading-relaxed">
            Edite serviços, fotos e depoimentos abaixo e clique em "Publicar" para salvar permanentemente no banco de dados e ativar no site público.
          </p>
        </div>
        <button
          onClick={handleSaveAll}
          disabled={isSaving}
          className="px-6 py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl font-black text-sm transition-all shadow-md shadow-orange-500/20 cursor-pointer flex items-center justify-center gap-2 shrink-0"
        >
          {isSaving ? (
            <>
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Publicando no Site...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              Publicar Alterações ➔
            </>
          )}
        </button>
      </div>

      {/* SECTION 1: PROJECTS / SERVICES */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex justify-between items-center pb-3 border-b border-gray-100">
          <div>
            <h2 className="text-base font-bold text-gray-950 flex items-center gap-2">
              📂 Serviços / Fotos dos Projetos
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Gerencie os serviços e fotos dos projetos exibidos na galeria de casos de sucesso do site.
            </p>
          </div>
          {!showProjectForm && (
            <button
              onClick={startAddProject}
              className="px-4 py-2 border border-orange-200 text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-lg text-xs font-bold transition-all cursor-pointer"
            >
              + Novo Serviço / Projeto
            </button>
          )}
        </div>

        {/* Project Form */}
        {showProjectForm && (
          <form onSubmit={saveProject} className="p-5 bg-gray-50 rounded-xl border border-gray-200 space-y-4">
            <h3 className="text-sm font-bold text-gray-900">
              {editingProjectId ? '📝 Editar Serviço / Projeto' : '✨ Adicionar Novo Serviço / Projeto'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className={labelClass}>Título do Serviço / Projeto</label>
                <input
                  type="text"
                  value={projectTitle}
                  onChange={e => setProjectTitle(e.target.value)}
                  placeholder="Ex: Carport Solar Premium"
                  className={inputClass}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className={labelClass}>Categoria / Serviço</label>
                <select
                  value={projectCategory}
                  onChange={e => setProjectCategory(e.target.value)}
                  className={selectClass}
                >
                  <option value="Geração Solar">Geração Solar</option>
                  <option value="Greentech Charge">Greentech Charge (EV)</option>
                  <option value="Solar + Carregamento">Solar + Carregamento</option>
                  <option value="Carport Solar">Carport Solar</option>
                  <option value="Manutenção">Manutenção</option>
                  <option value="Consultoria">Consultoria</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className={labelClass}>Descrição do Projeto</label>
              <textarea
                rows={3}
                value={projectDescription}
                onChange={e => setProjectDescription(e.target.value)}
                placeholder="Descreva as soluções instaladas, potência gerada, diferenciais..."
                className={`${inputClass} resize-none`}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className={labelClass}>Nome do Cliente</label>
                <input
                  type="text"
                  value={projectClient}
                  onChange={e => setProjectClient(e.target.value)}
                  placeholder="Ex: Condomínio Royal"
                  className={inputClass}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className={labelClass}>Cidade - UF</label>
                <input
                  type="text"
                  value={projectLocation}
                  onChange={e => setProjectLocation(e.target.value)}
                  placeholder="Ex: Itajaí - SC"
                  className={inputClass}
                  required
                />
              </div>
            </div>

            {/* Image Selection */}
            <div className="space-y-3">
              <label className={labelClass}>Foto do Projeto</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setImageMode('preset')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                    imageMode === 'preset'
                      ? 'bg-orange-500 text-white border-orange-500'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300'
                  }`}
                >
                  📷 Imagens Padrão
                </button>
                <button
                  type="button"
                  onClick={() => setImageMode('url')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                    imageMode === 'url'
                      ? 'bg-orange-500 text-white border-orange-500'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300'
                  }`}
                >
                  🔗 URL da Foto
                </button>
              </div>

              {imageMode === 'preset' ? (
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: '/hero_carport_dusk.png', label: 'Carport Solar (Noite/Neon)' },
                    { value: '/condo_ev_charging.png', label: 'Garagem Condomínio (Wallbox)' },
                  ].map(opt => (
                    <label
                      key={opt.value}
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                        projectImagePreset === opt.value
                          ? 'border-orange-400 bg-orange-50'
                          : 'border-gray-200 hover:border-orange-200'
                      }`}
                    >
                      <input
                        type="radio"
                        name="imagePreset"
                        value={opt.value}
                        checked={projectImagePreset === opt.value}
                        onChange={() => setProjectImagePreset(opt.value)}
                        className="accent-orange-500"
                      />
                      <span className="text-xs font-semibold text-gray-700">{opt.label}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="space-y-1">
                  <input
                    type="url"
                    value={projectImageUrl}
                    onChange={e => setProjectImageUrl(e.target.value)}
                    placeholder="https://exemplo.com/foto-do-projeto.jpg"
                    className={inputClass}
                  />
                  <p className="text-[10px] text-gray-400">
                    Cole a URL direta da foto (JPG, PNG, WebP).
                  </p>
                  {projectImageUrl && (
                    <div className="mt-2 rounded-lg overflow-hidden border border-gray-200 w-full max-h-40">
                      <img
                        src={projectImageUrl}
                        alt="Preview"
                        className="w-full h-40 object-cover"
                        onError={e => {
                          (e.target as HTMLImageElement).src = '/hero_carport_dusk.png';
                        }}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowProjectForm(false);
                  setEditingProjectId(null);
                }}
                className="px-4 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg text-xs font-bold transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
              >
                Confirmar
              </button>
            </div>
          </form>
        )}

        {/* Projects List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {portfolio.map(proj => (
            <div
              key={proj.id}
              className="border border-gray-150 rounded-xl overflow-hidden hover:border-orange-200 transition-colors flex flex-col"
            >
              <div className="h-32 overflow-hidden bg-gray-100">
                <img
                  src={proj.imageUrl}
                  alt={proj.title}
                  className="w-full h-full object-cover"
                  onError={e => {
                    (e.target as HTMLImageElement).src = '/hero_carport_dusk.png';
                  }}
                />
              </div>
              <div className="p-4 flex flex-col justify-between flex-1 space-y-2">
                <div className="space-y-1.5">
                  <div className="flex justify-between items-start gap-2">
                    <span className="px-2 py-0.5 rounded bg-orange-50 text-[10px] text-orange-600 font-extrabold uppercase">
                      {proj.category}
                    </span>
                    <span className="text-[10px] text-gray-400 font-bold shrink-0">{proj.location}</span>
                  </div>
                  <h4 className="text-sm font-bold text-gray-900 leading-snug">{proj.title}</h4>
                  <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{proj.description}</p>
                  <div className="text-[10px] text-gray-400 font-semibold uppercase">
                    Cliente: {proj.clientName}
                  </div>
                </div>
                <div className="flex gap-2 justify-end pt-3 border-t border-gray-50">
                  <button
                    onClick={() => startEditProject(proj)}
                    className="px-2.5 py-1 text-[11px] font-bold text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => deleteProject(proj.id)}
                    className="px-2.5 py-1 text-[11px] font-bold text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            </div>
          ))}
          {portfolio.length === 0 && (
            <p className="col-span-2 text-center text-xs text-gray-400 italic py-8 bg-gray-50 rounded-xl">
              Nenhum projeto cadastrado. Clique em "+ Novo Serviço / Projeto" para adicionar.
            </p>
          )}
        </div>
      </div>

      {/* SECTION 2: TESTIMONIALS */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex justify-between items-center pb-3 border-b border-gray-100">
          <div>
            <h2 className="text-base font-bold text-gray-950 flex items-center gap-2">
              ⭐ Depoimentos de Clientes (Com Foto)
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Gerencie os depoimentos e avaliações que validam seus serviços no site.
            </p>
          </div>
          {!showTestForm && (
            <button
              onClick={startAddTestimonial}
              className="px-4 py-2 border border-orange-200 text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-lg text-xs font-bold transition-all cursor-pointer"
            >
              + Novo Depoimento
            </button>
          )}
        </div>

        {/* Testimonial Form */}
        {showTestForm && (
          <form onSubmit={saveTestimonial} className="p-5 bg-gray-50 rounded-xl border border-gray-200 space-y-4">
            <h3 className="text-sm font-bold text-gray-900">
              {editingTestimonialId ? '📝 Editar Depoimento' : '✨ Adicionar Novo Depoimento'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1 md:col-span-2">
                <label className={labelClass}>Nome do Cliente</label>
                <input
                  type="text"
                  value={testClient}
                  onChange={e => setTestClient(e.target.value)}
                  placeholder="Ex: Carlos Eduardo de Souza"
                  className={inputClass}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className={labelClass}>Avaliação</label>
                <select
                  value={testRating}
                  onChange={e => setTestRating(Number(e.target.value))}
                  className={selectClass}
                >
                  <option value="5">★★★★★ (5 Estrelas)</option>
                  <option value="4">★★★★☆ (4 Estrelas)</option>
                  <option value="3">★★★☆☆ (3 Estrelas)</option>
                  <option value="2">★★☆☆☆ (2 Estrelas)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className={labelClass}>Cargo / Identificação do Cliente</label>
              <input
                type="text"
                value={testRole}
                onChange={e => setTestRole(e.target.value)}
                placeholder="Ex: Síndico do Res. Royal / Proprietário de Tesla Model 3"
                className={inputClass}
              />
            </div>

            <div className="space-y-1">
              <label className={labelClass}>URL da Foto do Cliente (Opcional)</label>
              <input
                type="url"
                value={testAvatarUrl}
                onChange={e => setTestAvatarUrl(e.target.value)}
                placeholder="https://exemplo.com/foto-cliente.jpg"
                className={inputClass}
              />
            </div>

            <div className="space-y-1">
              <label className={labelClass}>Depoimento / Comentário</label>
              <textarea
                rows={3}
                value={testComment}
                onChange={e => setTestComment(e.target.value)}
                placeholder="Transcreva o feedback positivo fornecido pelo cliente..."
                className={`${inputClass} resize-none`}
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowTestForm(false);
                  setEditingTestimonialId(null);
                }}
                className="px-4 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg text-xs font-bold transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
              >
                Confirmar
              </button>
            </div>
          </form>
        )}

        {/* Testimonials List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {testimonials.map((t: Testimonial & { avatarUrl?: string }) => (
            <div
              key={t.id}
              className="p-4 border border-gray-150 rounded-xl flex flex-col justify-between hover:border-orange-200 transition-colors"
            >
              <div className="space-y-2">
                <div className="text-orange-500 text-sm">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <span key={i}>★</span>
                  ))}
                  {Array.from({ length: 5 - t.rating }).map((_, i) => (
                    <span key={i} className="text-gray-200">★</span>
                  ))}
                </div>
                <p className="text-xs text-gray-600 italic leading-relaxed">"{t.comment}"</p>
                <div className="flex items-center gap-3 pt-1">
                  <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-xs overflow-hidden shrink-0">
                    {t.avatarUrl ? (
                      <img src={t.avatarUrl} alt={t.clientName} className="w-full h-full object-cover" />
                    ) : (
                      t.clientName.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">{t.clientName}</h4>
                    <span className="text-[10px] text-gray-400 font-semibold">{t.role}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-4 border-t border-gray-50 mt-3">
                <button
                  onClick={() => startEditTestimonial(t)}
                  className="px-2.5 py-1 text-[11px] font-bold text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                >
                  Editar
                </button>
                <button
                  onClick={() => deleteTestimonial(t.id)}
                  className="px-2.5 py-1 text-[11px] font-bold text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                >
                  Excluir
                </button>
              </div>
            </div>
          ))}
          {testimonials.length === 0 && (
            <p className="col-span-2 text-center text-xs text-gray-400 italic py-8 bg-gray-50 rounded-xl">
              Nenhum depoimento cadastrado.
            </p>
          )}
        </div>
      </div>

      {/* SECTION 3: PARCEIROS & MARCAS */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex justify-between items-center pb-3 border-b border-gray-100">
          <div>
            <h2 className="text-base font-bold text-gray-950 flex items-center gap-2">
              🤝 Nossos Parceiros (Logomarcas & Marcas)
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Gerencie as logomarcas dos parceiros e clientes corporativos exibidos no site público.
            </p>
          </div>
          <button
            onClick={startAddPartner}
            className="px-3.5 py-2 bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <span>+ Adicionar Parceiro</span>
          </button>
        </div>

        {/* Partner Form */}
        {showPartnerForm && (
          <form onSubmit={savePartner} className="p-4 bg-orange-50/60 border border-orange-150 rounded-xl space-y-4">
            <h3 className="text-xs font-bold text-orange-950 uppercase tracking-wider">
              {editingPartnerId ? 'Editar Parceiro' : 'Adicionar Novo Parceiro'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className={labelClass}>Nome do Parceiro *</label>
                <input
                  type="text"
                  value={partnerName}
                  onChange={e => setPartnerName(e.target.value)}
                  placeholder="Ex: Bosch Service, JBS, WEG"
                  className={inputClass}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className={labelClass}>Link do Site do Parceiro (Opcional)</label>
                <input
                  type="url"
                  value={partnerWebsiteUrl}
                  onChange={e => setPartnerWebsiteUrl(e.target.value)}
                  placeholder="Ex: https://www.bosch.com.br"
                  className={inputClass}
                />
              </div>
            </div>

            {/* Selector para Logomarca */}
            <div className="space-y-3">
              <label className={labelClass}>Imagem da Logomarca *</label>

              {/* Mode Selector Tabs */}
              <div className="flex flex-wrap gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setPartnerImageMode('upload')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    partnerImageMode === 'upload'
                      ? 'bg-orange-500 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Enviar Imagem (Upload)
                </button>

                <button
                  type="button"
                  onClick={() => setPartnerImageMode('preset')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    partnerImageMode === 'preset'
                      ? 'bg-orange-500 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 002-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Logomarcas Prontas (Presets)
                </button>

                <button
                  type="button"
                  onClick={() => setPartnerImageMode('url')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    partnerImageMode === 'url'
                      ? 'bg-orange-500 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  Link de Imagem (URL)
                </button>
              </div>

              {/* Mode 1: File Upload Box */}
              {partnerImageMode === 'upload' && (
                <div className="space-y-3">
                  <div className="border-2 border-dashed border-orange-300 hover:border-orange-500 bg-white hover:bg-orange-50/50 rounded-2xl p-6 transition-all text-center flex flex-col items-center justify-center cursor-pointer relative group">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePartnerImageFile}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                    </div>
                    <p className="text-sm font-extrabold text-orange-950">
                      Clique aqui para selecionar a imagem da logo do seu arquivo
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Suporta PNG, JPG, WEBP e SVG (máximo 5MB)
                    </p>
                  </div>

                  {partnerLogoUrl && (
                    <div className="flex items-center gap-4 p-3 bg-white border border-green-200 rounded-xl shadow-sm">
                      <div className="w-16 h-16 rounded-lg border border-gray-100 bg-gray-50 p-1 flex items-center justify-center shrink-0 overflow-hidden">
                        <img src={partnerLogoUrl} alt="Preview Logo" className="max-h-full max-w-full object-contain" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-900 truncate">Imagem selecionada com sucesso!</p>
                        <p className="text-[10px] text-green-600 font-bold">✓ Pronta para ser salva</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setPartnerLogoUrl('')}
                        className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-xs font-bold transition-all cursor-pointer"
                      >
                        Remover
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Mode 2: Presets */}
              {partnerImageMode === 'preset' && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <button
                    type="button"
                    onClick={() => setPartnerLogoPreset('/partners/bosch.svg')}
                    className={`p-3 border rounded-xl flex flex-col items-center justify-center gap-2 bg-white transition-all cursor-pointer ${
                      partnerLogoPreset === '/partners/bosch.svg'
                        ? 'border-orange-500 ring-2 ring-orange-200 bg-orange-50/30'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img src="/partners/bosch.svg" alt="Bosch" className="h-10 object-contain" />
                    <span className="text-[10px] font-bold text-gray-700">Bosch Service</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPartnerLogoPreset('/partners/jbs.svg')}
                    className={`p-3 border rounded-xl flex flex-col items-center justify-center gap-2 bg-white transition-all cursor-pointer ${
                      partnerLogoPreset === '/partners/jbs.svg'
                        ? 'border-orange-500 ring-2 ring-orange-200 bg-orange-50/30'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img src="/partners/jbs.svg" alt="JBS" className="h-10 object-contain" />
                    <span className="text-[10px] font-bold text-gray-700">JBS</span>
                  </button>
                </div>
              )}

              {/* Mode 3: Custom URL */}
              {partnerImageMode === 'url' && (
                <div className="space-y-2">
                  <input
                    type="url"
                    value={partnerLogoUrl}
                    onChange={e => setPartnerLogoUrl(e.target.value)}
                    placeholder="https://exemplo.com/sua-logo.png"
                    className={inputClass}
                  />
                  {partnerLogoUrl && (
                    <div className="flex items-center gap-3 p-2 bg-gray-50 border rounded-lg">
                      <img src={partnerLogoUrl} alt="Preview" className="h-8 max-w-[80px] object-contain" />
                      <span className="text-[11px] text-gray-600 truncate">{partnerLogoUrl}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowPartnerForm(false);
                  setEditingPartnerId(null);
                }}
                className="px-4 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg text-xs font-bold transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
              >
                Confirmar
              </button>
            </div>
          </form>
        )}

        {/* Partners Grid List */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {partners && partners.map((p: PartnerLogo) => (
            <div
              key={p.id}
              className="p-4 border border-gray-150 rounded-xl flex flex-col items-center justify-between hover:border-orange-200 transition-colors bg-gray-50/40"
            >
              <div className="flex flex-col items-center gap-2 w-full">
                <div className="h-14 w-full flex items-center justify-center p-1 bg-white rounded-lg border border-gray-100">
                  <img src={p.logoUrl} alt={p.name} className="max-h-full max-w-full object-contain" />
                </div>
                <h4 className="text-xs font-bold text-gray-900 text-center line-clamp-1 mt-1">{p.name}</h4>
                {p.websiteUrl && (
                  <span className="text-[10px] text-orange-600 truncate max-w-full font-medium">{p.websiteUrl}</span>
                )}
              </div>

              <div className="flex gap-2 justify-center pt-3 border-t border-gray-100 w-full mt-3">
                <button
                  onClick={() => startEditPartner(p)}
                  className="px-2.5 py-1 text-[11px] font-bold text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                >
                  Editar
                </button>
                <button
                  onClick={() => deletePartner(p.id)}
                  className="px-2.5 py-1 text-[11px] font-bold text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                >
                  Excluir
                </button>
              </div>
            </div>
          ))}
          {(!partners || partners.length === 0) && (
            <p className="col-span-full text-center text-xs text-gray-400 italic py-8 bg-gray-50 rounded-xl">
              Nenhum parceiro cadastrado. Clique em "+ Adicionar Parceiro" acima.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
