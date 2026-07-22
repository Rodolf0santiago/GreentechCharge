'use client';

import React, { useState, useRef } from 'react';
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
  const [projectGallery, setProjectGallery] = useState<string[]>([]);
  const [newGalleryInput, setNewGalleryInput] = useState('');
  const [showProjectForm, setShowProjectForm] = useState(false);

  // States for Testimonial Form
  const [editingTestimonialId, setEditingTestimonialId] = useState<string | null>(null);
  const [testClient, setTestClient] = useState('');
  const [testRole, setTestRole] = useState('');
  const [testComment, setTestComment] = useState('');
  const [testRating, setTestRating] = useState<number>(5);
  const [testAvatarUrl, setTestAvatarUrl] = useState<string>('');
  const [showTestForm, setShowTestForm] = useState(false);

  // Refs for file inputs
  const mainImageFileRef = useRef<HTMLInputElement>(null);
  const galleryImageFileRef = useRef<HTMLInputElement>(null);
  const avatarFileRef = useRef<HTMLInputElement>(null);

  // Helper to read file as Data URL
  const handleFileUpload = (file: File, callback: (dataUrl: string) => void) => {
    if (!file.type.startsWith('image/')) {
      showToast('Selecione apenas arquivos de imagem (PNG, JPG, WebP).', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('A imagem deve ter no máximo 5MB.', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        callback(e.target.result as string);
        showToast('Foto carregada com sucesso!', 'success');
      }
    };
    reader.readAsDataURL(file);
  };

  // PROJECT ACTIONS
  const startAddProject = () => {
    setEditingProjectId(null);
    setProjectTitle('');
    setProjectCategory('Geração Solar');
    setProjectDescription('');
    setProjectClient('');
    setProjectLocation('');
    setProjectImage('/hero_carport_dusk.png');
    setProjectGallery(['/hero_carport_dusk.png']);
    setNewGalleryInput('');
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
    setProjectGallery(proj.images && proj.images.length > 0 ? [...proj.images] : [proj.imageUrl]);
    setNewGalleryInput('');
    setShowProjectForm(true);
  };

  const addPhotoToGallery = (url: string) => {
    const trimmed = url.trim();
    if (!trimmed) return;
    if (projectGallery.includes(trimmed)) {
      showToast('Esta foto já foi adicionada à galeria.', 'error');
      return;
    }
    setProjectGallery(prev => [...prev, trimmed]);
    setNewGalleryInput('');
    showToast('Foto adicionada à galeria do serviço.', 'success');
  };

  const removePhotoFromGallery = (index: number) => {
    setProjectGallery(prev => {
      const updated = prev.filter((_, i) => i !== index);
      // Se a foto removida for a foto principal, atualizar a foto principal
      if (updated.length > 0 && !updated.includes(projectImage)) {
        setProjectImage(updated[0]);
      }
      return updated;
    });
  };

  const saveProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectTitle.trim()) {
      showToast('O título do projeto é obrigatório.', 'error');
      return;
    }

    const finalGallery = projectGallery.length > 0 ? projectGallery : [projectImage];
    const finalMainImage = projectImage || finalGallery[0] || '/hero_carport_dusk.png';

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
                imageUrl: finalMainImage,
                images: finalGallery,
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
        imageUrl: finalMainImage,
        images: finalGallery,
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
    setTestAvatarUrl('');
    setShowTestForm(true);
  };

  const startEditTestimonial = (test: Testimonial) => {
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
                avatarUrl: testAvatarUrl.trim(),
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
        avatarUrl: testAvatarUrl.trim(),
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
            As alterações feitas nos projetos, fotos dos serviços e depoimentos ficam salvas na sua sessão. Clique no botão de publicação para ativá-las imediatamente no site público.
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

      {/* SECTION 1: PROJECTS & PHOTOS SHOWCASE */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex justify-between items-center pb-3 border-b border-gray-100">
          <div>
            <h2 className="text-base font-bold text-gray-950 flex items-center gap-2">
              📸 Serviços Já Feitos (Fotos e Portfólio)
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Inclua e gerencie fotos dos serviços realizados pela equipe.</p>
          </div>
          {!showProjectForm && (
            <button
              onClick={startAddProject}
              className="px-4 py-2 border border-orange-200 text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>+ Novo Serviço / Projeto</span>
            </button>
          )}
        </div>

        {/* Project Form */}
        {showProjectForm && (
          <form onSubmit={saveProject} className="p-6 bg-gray-50/80 rounded-2xl border border-gray-200 space-y-5">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                {editingProjectId ? '📝 Editar Serviço Realizado' : '✨ Incluir Novo Serviço Realizado'}
              </h3>
              <span className="text-[11px] text-gray-400 font-medium">Preencha os dados e inclua as fotos do serviço</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className={labelClass}>Título do Serviço / Projeto</label>
                <input
                  type="text"
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  placeholder="Ex: Instalação Wallbox 22kW Residencial"
                  className={inputClass}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className={labelClass}>Categoria do Serviço</label>
                <select
                  value={projectCategory}
                  onChange={(e) => setProjectCategory(e.target.value)}
                  className={selectClass}
                >
                  <option value="Greentech Charge">Greentech Charge (EV)</option>
                  <option value="Geração Solar">Geração Solar</option>
                  <option value="Solar + Carregamento">Solar + Carregamento</option>
                  <option value="Carport Solar">Carport Solar</option>
                  <option value="Manutenção e Adequação">Manutenção e Adequação</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className={labelClass}>Descrição Detalhada do Serviço</label>
              <textarea
                rows={3}
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                placeholder="Descreva a estrutura instalada, equipamentos utilizados e os detalhes da obra..."
                className={`${inputClass} resize-none`}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className={labelClass}>Nome do Cliente ou Condomínio</label>
                <input
                  type="text"
                  value={projectClient}
                  onChange={(e) => setProjectClient(e.target.value)}
                  placeholder="Ex: Condomínio Edifício Royal"
                  className={inputClass}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className={labelClass}>Cidade - Estado</label>
                <input
                  type="text"
                  value={projectLocation}
                  onChange={(e) => setProjectLocation(e.target.value)}
                  placeholder="Ex: Florianópolis - SC"
                  className={inputClass}
                  required
                />
              </div>
            </div>

            {/* SEÇÃO DE GERENCIAMENTO DE FOTOS DO SERVIÇO */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-gray-800 flex items-center gap-1.5">
                    🖼️ Fotos do Serviço Realizado
                  </h4>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Faça upload de fotos do serviço pronto ou insira o link/URL das fotos.
                  </p>
                </div>
              </div>

              {/* Botões de Upload e Entrada por URL */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                <div className="md:col-span-8 space-y-1">
                  <label className="text-[11px] font-bold text-gray-600">Inserir URL de Foto Adicional</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newGalleryInput}
                      onChange={(e) => setNewGalleryInput(e.target.value)}
                      placeholder="https://exemplo.com/foto-servico.jpg ou /minha-foto.jpg"
                      className={inputClass}
                    />
                    <button
                      type="button"
                      onClick={() => addPhotoToGallery(newGalleryInput)}
                      className="px-4 py-2 bg-gray-900 hover:bg-black text-white rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer"
                    >
                      + Adicionar URL
                    </button>
                  </div>
                </div>

                <div className="md:col-span-4 space-y-1">
                  <label className="text-[11px] font-bold text-gray-600">Ou Enviar Foto Local</label>
                  <input
                    type="file"
                    ref={galleryImageFileRef}
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleFileUpload(file, (dataUrl) => {
                          addPhotoToGallery(dataUrl);
                        });
                        e.target.value = '';
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => galleryImageFileRef.current?.click()}
                    className="w-full py-2.5 bg-orange-50 border border-orange-200 text-orange-700 hover:bg-orange-100 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    Carregar do Computador
                  </button>
                </div>
              </div>

              {/* Sugestões de Imagens do Sistema */}
              <div className="space-y-1 pt-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Fotos Pré-definidas do Sistema:</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => addPhotoToGallery('/hero_carport_dusk.png')}
                    className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-[11px] font-medium rounded-lg transition-colors cursor-pointer"
                  >
                    + Carport Solar (Noturno)
                  </button>
                  <button
                    type="button"
                    onClick={() => addPhotoToGallery('/condo_ev_charging.png')}
                    className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-[11px] font-medium rounded-lg transition-colors cursor-pointer"
                  >
                    + Carregador Condomínio
                  </button>
                </div>
              </div>

              {/* Lista e Pré-visualização da Galeria de Fotos */}
              <div className="space-y-2 pt-2">
                <label className="text-[11px] font-bold text-gray-700 flex items-center justify-between">
                  <span>Fotos na Galeria deste Serviço ({projectGallery.length})</span>
                  <span className="text-[10px] text-gray-400 font-normal">* A primeira foto marcada será a foto principal do card</span>
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {projectGallery.map((imgUrl, idx) => {
                    const isMain = projectImage === imgUrl;
                    return (
                      <div
                        key={idx}
                        className={`relative rounded-xl overflow-hidden border-2 transition-all bg-gray-900 group ${
                          isMain ? 'border-orange-500 shadow-md' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <img
                          src={imgUrl}
                          alt={`Foto do serviço ${idx + 1}`}
                          className="w-full h-24 object-cover opacity-90 group-hover:scale-105 transition-transform"
                        />
                        
                        {/* Overlay Controls */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-between">
                          <button
                            type="button"
                            onClick={() => removePhotoFromGallery(idx)}
                            className="self-end p-1 bg-rose-600 hover:bg-rose-700 text-white rounded-full text-[10px] transition-colors cursor-pointer shadow"
                            title="Remover foto"
                          >
                            ✕
                          </button>

                          {!isMain && (
                            <button
                              type="button"
                              onClick={() => setProjectImage(imgUrl)}
                              className="w-full py-1 bg-orange-500 hover:bg-orange-600 text-white text-[10px] font-bold rounded transition-colors cursor-pointer"
                            >
                              Tornar Principal
                            </button>
                          )}
                        </div>

                        {/* Main Badge */}
                        {isMain && (
                          <span className="absolute bottom-1 left-1 bg-orange-500 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded shadow">
                            Principal ★
                          </span>
                        )}
                      </div>
                    );
                  })}
                  {projectGallery.length === 0 && (
                    <div className="col-span-full p-4 border border-dashed border-gray-300 rounded-xl text-center text-xs text-gray-400 italic">
                      Nenhuma foto adicionada ainda. Adicione uma foto acima!
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-200">
              <button
                type="button"
                onClick={() => { setShowProjectForm(false); setEditingProjectId(null); }}
                className="px-4 py-2.5 bg-white border border-gray-250 text-gray-700 hover:bg-gray-100 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-black transition-all cursor-pointer shadow-md shadow-orange-500/20"
              >
                Salvar Serviço no Site
              </button>
            </div>
          </form>
        )}

        {/* Projects List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {portfolio.map(proj => (
            <div key={proj.id} className="p-4 border border-gray-200 rounded-2xl flex flex-col justify-between hover:border-orange-300 transition-colors bg-white shadow-sm">
              <div className="space-y-3">
                {/* Photo Preview Card Header */}
                <div className="relative h-40 w-full rounded-xl overflow-hidden bg-gray-900 border border-gray-100">
                  <img
                    src={proj.imageUrl}
                    alt={proj.title}
                    className="w-full h-full object-cover opacity-90"
                  />
                  <div className="absolute top-2 left-2 flex gap-1.5 flex-wrap">
                    <span className="px-2 py-0.5 rounded-full bg-orange-500 text-white text-[9px] font-extrabold uppercase shadow">
                      {proj.category}
                    </span>
                    {proj.images && proj.images.length > 1 && (
                      <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[9px] font-bold">
                        📷 {proj.images.length} fotos
                      </span>
                    )}
                  </div>
                  <span className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-md text-gray-200 px-2 py-0.5 rounded text-[10px] font-bold">
                    📍 {proj.location}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-gray-900 leading-snug">{proj.title}</h4>
                  <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mt-1">{proj.description}</p>
                </div>
                
                <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                  Cliente: <span className="text-gray-700 font-bold">{proj.clientName}</span>
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-3 border-t border-gray-100 mt-4">
                <button
                  onClick={() => startEditProject(proj)}
                  className="px-3 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                >
                  ✏️ Editar Fotos e Dados
                </button>
                <button
                  onClick={() => deleteProject(proj.id)}
                  className="px-3 py-1.5 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                >
                  🗑️ Excluir
                </button>
              </div>
            </div>
          ))}
          {portfolio.length === 0 && (
            <p className="col-span-2 text-center text-xs text-gray-400 italic py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              Nenhum serviço já feito cadastrado. Clique em "+ Novo Serviço / Projeto" para incluir fotos!
            </p>
          )}
        </div>
      </div>

      {/* SECTION 2: TESTIMONIALS & CUSTOMER AVATARS */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex justify-between items-center pb-3 border-b border-gray-100">
          <div>
            <h2 className="text-base font-bold text-gray-950 flex items-center gap-2">
              ⭐ Depoimentos de Clientes (Com Foto)
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Inclua e gerencie os depoimentos com foto dos clientes satisfeitos.</p>
          </div>
          {!showTestForm && (
            <button
              onClick={startAddTestimonial}
              className="px-4 py-2 border border-orange-200 text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>+ Novo Depoimento</span>
            </button>
          )}
        </div>

        {/* Testimonial Form */}
        {showTestForm && (
          <form onSubmit={saveTestimonial} className="p-6 bg-gray-50/80 rounded-2xl border border-gray-200 space-y-5">
            <h3 className="text-sm font-bold text-gray-900 border-b border-gray-200 pb-2">
              {editingTestimonialId ? '📝 Editar Depoimento' : '✨ Incluir Novo Depoimento'}
            </h3>
            
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
                placeholder="Ex: Síndico do Res. Royal / Proprietário de Veículo Elétrico"
                className={inputClass}
                required
              />
            </div>

            {/* FOTO DO CLIENTE NO DEPOIMENTO */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-3">
              <label className="text-xs font-black uppercase tracking-wider text-gray-800 flex items-center gap-1.5">
                👤 Foto do Cliente (Opcional)
              </label>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                {/* Preview Avatar */}
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white font-extrabold text-lg overflow-hidden shrink-0 border-2 border-orange-200 shadow-sm">
                  {testAvatarUrl ? (
                    <img src={testAvatarUrl} alt={testClient || 'Cliente'} className="w-full h-full object-cover" />
                  ) : (
                    testClient ? testClient.charAt(0).toUpperCase() : '👤'
                  )}
                </div>

                <div className="space-y-2 flex-1 w-full">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={testAvatarUrl}
                      onChange={(e) => setTestAvatarUrl(e.target.value)}
                      placeholder="URL da foto (ex: https://site.com/foto.jpg) ou faça upload"
                      className={inputClass}
                    />
                    <input
                      type="file"
                      ref={avatarFileRef}
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleFileUpload(file, (dataUrl) => {
                            setTestAvatarUrl(dataUrl);
                          });
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => avatarFileRef.current?.click()}
                      className="px-3.5 py-2 bg-orange-50 border border-orange-200 text-orange-700 hover:bg-orange-100 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      Enviar Foto
                    </button>
                  </div>
                  {testAvatarUrl && (
                    <button
                      type="button"
                      onClick={() => setTestAvatarUrl('')}
                      className="text-[11px] text-rose-600 hover:underline font-semibold"
                    >
                      Remover foto do cliente
                    </button>
                  )}
                </div>
              </div>
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

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-200">
              <button
                type="button"
                onClick={() => { setShowTestForm(false); setEditingTestimonialId(null); }}
                className="px-4 py-2.5 bg-white border border-gray-250 text-gray-700 hover:bg-gray-100 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-black transition-all cursor-pointer shadow-md shadow-orange-500/20"
              >
                Salvar Depoimento
              </button>
            </div>
          </form>
        )}

        {/* Testimonials List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {testimonials.map(t => (
            <div key={t.id} className="p-4 border border-gray-200 rounded-2xl flex flex-col justify-between hover:border-orange-300 transition-colors bg-white shadow-sm">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="text-amber-400 text-sm font-bold">
                    {Array.from({ length: t.rating }).map((_, i) => '★')}
                  </div>
                </div>

                <p className="text-xs text-gray-600 italic leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100">
                  "{t.comment}"
                </p>

                <div className="flex items-center gap-3 pt-1">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white font-black text-sm overflow-hidden shrink-0 border border-orange-200 shadow-sm">
                    {t.avatarUrl ? (
                      <img src={t.avatarUrl} alt={t.clientName} className="w-full h-full object-cover" />
                    ) : (
                      t.clientName.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">{t.clientName}</h4>
                    <span className="text-[10px] text-gray-500 font-semibold">{t.role}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-3 border-t border-gray-100 mt-3">
                <button
                  onClick={() => startEditTestimonial(t)}
                  className="px-3 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                >
                  ✏️ Editar
                </button>
                <button
                  onClick={() => deleteTestimonial(t.id)}
                  className="px-3 py-1.5 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                >
                  🗑️ Excluir
                </button>
              </div>
            </div>
          ))}
          {testimonials.length === 0 && (
            <p className="col-span-2 text-center text-xs text-gray-400 italic py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              Nenhum depoimento cadastrado. Clique em "+ Novo Depoimento" para incluir!
            </p>
          )}
        </div>
      </div>

    </div>
  );
}
