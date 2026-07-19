'use client';

import React, { useState } from 'react';
import { saveLandingPageData, PortfolioProject, Testimonial } from '@/app/actions/landingPage';

interface LandingPageSettingsEditorProps {
  portfolio: PortfolioProject[];
  setPortfolio: React.Dispatch<React.SetStateAction<PortfolioProject[]>>;
  testimonials: Testimonial[];
  setTestimonials: React.Dispatch<React.SetStateAction<Testimonial[]>>;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

export default function LandingPageSettingsEditor({
  portfolio,
  setPortfolio,
  testimonials,
  setTestimonials,
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
  const [projectImage, setProjectImage] = useState('/hero_carport_dusk.png');
  const [showProjectForm, setShowProjectForm] = useState(false);

  // States for Testimonial Form
  const [editingTestimonialId, setEditingTestimonialId] = useState<string | null>(null);
  const [testClient, setTestClient] = useState('');
  const [testRole, setTestRole] = useState('');
  const [testComment, setTestComment] = useState('');
  const [testRating, setTestRating] = useState<number>(5);
  const [showTestForm, setShowTestForm] = useState(false);

  // PROJECT ACTIONS
  const startAddProject = () => {
    setEditingProjectId(null);
    setProjectTitle('');
    setProjectCategory('Geração Solar');
    setProjectDescription('');
    setProjectClient('');
    setProjectLocation('');
    setProjectImage('/hero_carport_dusk.png');
    setShowProjectForm(true);
  };

  const startEditProject = (proj: PortfolioProject) => {
    setEditingProjectId(proj.id);
    setProjectTitle(proj.title);
    setProjectCategory(proj.category);
    setProjectDescription(proj.description);
    setProjectClient(proj.clientName);
    setProjectLocation(proj.location);
    setProjectImage(proj.imageUrl);
    setShowProjectForm(true);
  };

  const saveProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectTitle.trim()) {
      showToast('O título do projeto é obrigatório.', 'error');
      return;
    }

    if (editingProjectId) {
      // Edit
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
                imageUrl: projectImage,
              }
            : p
        )
      );
      showToast('Projeto atualizado na lista temporária.', 'success');
    } else {
      // Add
      const newProj: PortfolioProject = {
        id: Date.now().toString(),
        title: projectTitle.trim(),
        category: projectCategory,
        description: projectDescription.trim(),
        clientName: projectClient.trim(),
        location: projectLocation.trim(),
        imageUrl: projectImage,
      };
      setPortfolio(prev => [...prev, newProj]);
      showToast('Novo projeto adicionado à lista temporária.', 'success');
    }

    setShowProjectForm(false);
    setEditingProjectId(null);
  };

  const deleteProject = (id: string) => {
    if (confirm('Tem certeza que deseja remover este projeto da landing page?')) {
      setPortfolio(prev => prev.filter(p => p.id !== id));
      showToast('Projeto removido da lista temporária.', 'success');
    }
  };

  // TESTIMONIAL ACTIONS
  const startAddTestimonial = () => {
    setEditingTestimonialId(null);
    setTestClient('');
    setTestRole('');
    setTestComment('');
    setTestRating(5);
    setShowTestForm(true);
  };

  const startEditTestimonial = (test: Testimonial) => {
    setEditingTestimonialId(test.id);
    setTestClient(test.clientName);
    setTestRole(test.role);
    setTestComment(test.comment);
    setTestRating(test.rating);
    setShowTestForm(true);
  };

  const saveTestimonial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testClient.trim() || !testComment.trim()) {
      showToast('Nome do cliente e depoimento são obrigatórios.', 'error');
      return;
    }

    if (editingTestimonialId) {
      // Edit
      setTestimonials(prev =>
        prev.map(t =>
          t.id === editingTestimonialId
            ? {
                ...t,
                clientName: testClient.trim(),
                role: testRole.trim(),
                comment: testComment.trim(),
                rating: testRating,
              }
            : t
        )
      );
      showToast('Depoimento atualizado na lista temporária.', 'success');
    } else {
      // Add
      const newTest: Testimonial = {
        id: Date.now().toString(),
        clientName: testClient.trim(),
        role: testRole.trim(),
        comment: testComment.trim(),
        rating: testRating,
      };
      setTestimonials(prev => [...prev, newTest]);
      showToast('Novo depoimento adicionado à lista temporária.', 'success');
    }

    setShowTestForm(false);
    setEditingTestimonialId(null);
  };

  const deleteTestimonial = (id: string) => {
    if (confirm('Tem certeza que deseja remover este depoimento da landing page?')) {
      setTestimonials(prev => prev.filter(t => t.id !== id));
      showToast('Depoimento removido da lista temporária.', 'success');
    }
  };

  // SAVE ALL TO DISK
  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      const res = await saveLandingPageData({
        projects: portfolio,
        testimonials: testimonials,
      });

      if (res.success) {
        showToast('Site atualizado com sucesso! As mudanças já estão ativas na página pública.', 'success');
      } else {
        showToast(res.error || 'Erro ao publicar dados no site.', 'error');
      }
    } catch (err: any) {
      showToast('Erro de conexão ao salvar dados do site.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const labelClass = "text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5 block";
  const inputClass = "w-full bg-gray-50 border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 rounded-xl px-4 py-2.5 text-gray-800 placeholder-gray-400 outline-none transition-all text-sm";
  const selectClass = "w-full bg-gray-50 border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 rounded-xl px-4 py-2.5 text-gray-800 outline-none transition-all text-sm cursor-pointer";

  return (
    <div className="space-y-8 pb-16">
      
      {/* Save Button Header */}
      <div className="bg-orange-50 border border-orange-100 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1">
          <h2 className="text-base font-bold text-orange-950">Publicar Alterações no Site</h2>
          <p className="text-xs text-orange-700 leading-relaxed">
            As alterações feitas nos projetos e depoimentos abaixo ficam salvas temporariamente na sua sessão. Clique no botão de publicação para ativá-las permanentemente no site público.
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
              <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              Publicar Alterações ➔
            </>
          )}
        </button>
      </div>

      {/* SECTION 1: PROJECTS SHOWCASE */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex justify-between items-center pb-3 border-b border-gray-100">
          <div>
            <h2 className="text-base font-bold text-gray-950 flex items-center gap-2">
              📂 Serviços já Feitos (Portfólio)
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Gerencie os projetos exibidos na galeria de casos de sucesso.</p>
          </div>
          {!showProjectForm && (
            <button
              onClick={startAddProject}
              className="px-4 py-2 border border-orange-200 text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-lg text-xs font-bold transition-all cursor-pointer"
            >
              + Novo Projeto
            </button>
          )}
        </div>

        {/* Project Form */}
        {showProjectForm && (
          <form onSubmit={saveProject} className="p-5 bg-gray-50 rounded-xl border border-gray-150 space-y-4">
            <h3 className="text-sm font-bold text-gray-900">{editingProjectId ? '📝 Editar Projeto' : '✨ Adicionar Novo Projeto'}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className={labelClass}>Título do Projeto</label>
                <input
                  type="text"
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  placeholder="Ex: Carport Solar Premium"
                  className={inputClass}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className={labelClass}>Categoria / Serviço</label>
                <select
                  value={projectCategory}
                  onChange={(e) => setProjectCategory(e.target.value)}
                  className={selectClass}
                >
                  <option value="Geração Solar">Geração Solar</option>
                  <option value="Greentech Charge">Greentech Charge (EV)</option>
                  <option value="Solar + Carregamento">Solar + Carregamento</option>
                  <option value="Carport Solar">Carport Solar</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className={labelClass}>Descrição do Projeto</label>
              <textarea
                rows={3}
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                placeholder="Descreva as soluções instaladas e a potência gerada..."
                className={`${inputClass} resize-none`}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className={labelClass}>Nome do Cliente</label>
                <input
                  type="text"
                  value={projectClient}
                  onChange={(e) => setProjectClient(e.target.value)}
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
                  onChange={(e) => setProjectLocation(e.target.value)}
                  placeholder="Ex: Itajaí - SC"
                  className={inputClass}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className={labelClass}>Imagem Ilustrativa</label>
                <select
                  value={projectImage}
                  onChange={(e) => setProjectImage(e.target.value)}
                  className={selectClass}
                >
                  <option value="/hero_carport_dusk.png">Carport Solar (Noite/Neon)</option>
                  <option value="/condo_ev_charging.png">Garagem Condomínio (Wallbox)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => { setShowProjectForm(false); setEditingProjectId(null); }}
                className="px-4 py-2 bg-white border border-gray-250 text-gray-700 hover:bg-gray-50 rounded-lg text-xs font-bold transition-all cursor-pointer"
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
            <div key={proj.id} className="p-4 border border-gray-150 rounded-xl flex flex-col justify-between hover:border-orange-200 transition-colors">
              <div className="space-y-2">
                <div className="flex justify-between items-start gap-2">
                  <span className="px-2 py-0.5 rounded bg-orange-50 text-[10px] text-orange-600 font-extrabold uppercase">{proj.category}</span>
                  <span className="text-[10px] text-gray-400 font-bold">{proj.location}</span>
                </div>
                <h4 className="text-sm font-bold text-gray-900 leading-snug">{proj.title}</h4>
                <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{proj.description}</p>
                <div className="text-[10px] text-gray-400 font-semibold uppercase">Cliente: {proj.clientName}</div>
              </div>

              <div className="flex gap-2 justify-end pt-4 border-t border-gray-50 mt-3">
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
          ))}
          {portfolio.length === 0 && (
            <p className="col-span-2 text-center text-xs text-gray-400 italic py-8 bg-gray-50 rounded-xl">Nenhum projeto cadastrado.</p>
          )}
        </div>
      </div>

      {/* SECTION 2: TESTIMONIALS */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex justify-between items-center pb-3 border-b border-gray-100">
          <div>
            <h2 className="text-base font-bold text-gray-950 flex items-center gap-2">
              ⭐ Depoimentos de Clientes
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Gerencie os depoimentos e avaliações que validam seus serviços.</p>
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
          <form onSubmit={saveTestimonial} className="p-5 bg-gray-50 rounded-xl border border-gray-150 space-y-4">
            <h3 className="text-sm font-bold text-gray-900">{editingTestimonialId ? '📝 Editar Depoimento' : '✨ Adicionar Novo Depoimento'}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1 md:col-span-2">
                <label className={labelClass}>Nome do Cliente</label>
                <input
                  type="text"
                  value={testClient}
                  onChange={(e) => setTestClient(e.target.value)}
                  placeholder="Ex: Carlos Eduardo de Souza"
                  className={inputClass}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className={labelClass}>Avaliação (Estrelas)</label>
                <select
                  value={testRating}
                  onChange={(e) => setTestRating(Number(e.target.value))}
                  className={selectClass}
                >
                  <option value="5">★★★★★ (5 Estrelas)</option>
                  <option value="4">★★★★☆ (4 Estrelas)</option>
                  <option value="3">★★★☆☆ (3 Estrelas)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className={labelClass}>Cargo / Identificação do Cliente</label>
              <input
                type="text"
                value={testRole}
                onChange={(e) => setTestRole(e.target.value)}
                placeholder="Ex: Síndico do Res. Royal / Proprietário de Tesla Model 3"
                className={inputClass}
                required
              />
            </div>

            <div className="space-y-1">
              <label className={labelClass}>Depoimento / Comentário</label>
              <textarea
                rows={3}
                value={testComment}
                onChange={(e) => setTestComment(e.target.value)}
                placeholder="Transcreva o feedback positivo fornecido pelo cliente..."
                className={`${inputClass} resize-none`}
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => { setShowTestForm(false); setEditingTestimonialId(null); }}
                className="px-4 py-2 bg-white border border-gray-250 text-gray-700 hover:bg-gray-50 rounded-lg text-xs font-bold transition-all cursor-pointer"
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
          {testimonials.map(t => (
            <div key={t.id} className="p-4 border border-gray-150 rounded-xl flex flex-col justify-between hover:border-orange-200 transition-colors">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="text-orange-500 text-xs">
                    {Array.from({ length: t.rating }).map((_, i) => '★')}
                  </div>
                </div>
                <p className="text-xs text-gray-600 italic leading-relaxed">"{t.comment}"</p>
                <div>
                  <h4 className="text-xs font-bold text-gray-900">{t.clientName}</h4>
                  <span className="text-[10px] text-gray-400 font-semibold">{t.role}</span>
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
            <p className="col-span-2 text-center text-xs text-gray-400 italic py-8 bg-gray-50 rounded-xl">Nenhum depoimento cadastrado.</p>
          )}
        </div>
      </div>

    </div>
  );
}
