'use client';

import React, { useState, useEffect } from 'react';
import LeadForm from '@/components/public/lead-form';
import WhatsAppButton from '@/components/public/whatsapp-button';
import EconomyCalculator from '@/components/public/economy-calculator';
import { getLandingPageData, PortfolioProject, Testimonial } from '@/app/actions/landingPage';

export default function LandingPage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrollActive, setScrollActive] = useState(false);
  const [portfolio, setPortfolio] = useState<PortfolioProject[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrollActive(true);
      } else {
        setScrollActive(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    async function loadDynamicData() {
      try {
        const data = await getLandingPageData();
        setPortfolio(data.projects);
        setTestimonials(data.testimonials);
      } catch (err) {
        console.error('Erro ao carregar dados do portfólio/depoimentos:', err);
      }
    }
    loadDynamicData();
  }, []);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const faqs = [
    {
      question: 'Qual é o papel do síndico na aprovação do projeto?',
      answer: 'O síndico desempenha um papel fundamental na mediação. Apresentamos uma proposta detalhada que demonstra o ganho patrimonial do condomínio, regras justas de rateio da energia consumida e sistemas de controle individualizado. A aprovação segue quóruns simplificados previstos no Código Civil para melhorias necessárias ou úteis.',
    },
    {
      question: 'É seguro instalar múltiplos carregadores na garagem coletiva?',
      answer: 'Sim, totalmente. Nossos projetos contam com dimensionamento minucioso de carga e dispositivos de proteção dedicados (DPS contra surtos de tensão e disjuntores com IDR Tipo B de alta sensibilidade). Além disso, implementamos um sistema de gestão dinâmica de energia (Load Shedding) que monitora o consumo do condomínio e ajusta a potência das estações para evitar sobrecarga.',
    },
    {
      question: 'Quais normas técnicas regulam as instalações?',
      answer: 'As instalações da Greentech obedecem estritamente à NBR 17019 da ABNT, que regulamenta os requisitos de infraestrutura para recarga de veículos elétricos. Também seguimos à risca as instruções técnicas do Corpo de Bombeiros Militar de cada estado (como a IT-22), garantindo demarcações de vagas adequadas, sistemas de combate a incêndio locais e sinalização de segurança.',
    },
  ];

  const checklistItems = [
    {
      title: 'Capacidade Elétrica',
      desc: 'Avaliação técnica da capacidade total do padrão de entrada e se há necessidade de aumento de carga contratada perante a concessionária.',
    },
    {
      title: 'Quadro de Distribuição',
      desc: 'Dimensionamento de espaço físico para disjuntores adicionais e componentes protetivos exigidos por norma.',
    },
    {
      title: 'Infraestrutura Existente',
      desc: 'Análise detalhada de eletrodutos, leitos de cabos e passagens de cabos que podem ser reaproveitados para otimização de custos.',
    },
    {
      title: 'Rotas de Cabos',
      desc: 'Definição estratégica da trajetória da fiação a partir do quadro geral até a localização final do carregador, minimizando perdas e impactos visuais.',
    },
    {
      title: 'Sistema de Proteção',
      desc: 'Configuração de aterramento exclusivo com hastes próprias e dispositivos de proteção IDR (Tipo B) e DPS dedicados a cada carregador.',
    },
    {
      title: 'Normas do Bombeiro',
      desc: 'Avaliação de conformidade com exigências estaduais para segurança contra incêndios e pânico em garagens internas e externas.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-[#E0E0E0] font-sans selection:bg-[#A4E83C] selection:text-black overflow-x-hidden relative">
      {/* Background Glow Grid */}
      <div className="absolute inset-0 bg-grid-pattern pointer-events-none z-0" />

      {/* Floating Ambient Glow Lights */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#A4E83C]/5 rounded-full blur-[120px] pointer-events-none z-0 animate-pulse-slow" />
      <div className="absolute top-2/3 right-1/4 w-[600px] h-[600px] bg-[#00A9E0]/5 rounded-full blur-[130px] pointer-events-none z-0" />

      {/* Header / Nav */}
      <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${scrollActive ? 'bg-[#0A0A0A]/95 backdrop-blur-md border-b border-neutral-900 glow-cyan/10 py-4' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <a href="#" className="flex items-center gap-2 group">
            {/* Logo Image in Premium Badge */}
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center overflow-hidden border border-white/20 transition-transform group-hover:scale-105 shadow-[0_0_15px_rgba(164,232,60,0.2)]">
              <img src="/logo.png" alt="Logo Greentech" className="w-8 h-8 object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-wider text-white leading-none">GRUPO GREENTECH</span>
              <span className="text-[9px] uppercase tracking-[0.35em] text-[#00A9E0] leading-none mt-1">Sustentabilidade & Energia</span>
            </div>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center space-x-8 text-sm font-semibold text-neutral-300">
            <a href="#hero" className="hover:text-[#A4E83C] transition-colors">Início</a>
            <a href="#servicos" className="hover:text-[#A4E83C] transition-colors">Serviços</a>
            <a href="#condominios" className="hover:text-[#A4E83C] transition-colors">Condomínios</a>
            <a href="#beneficios" className="hover:text-[#A4E83C] transition-colors">Benefícios</a>
            <a href="#calculadora" className="hover:text-[#A4E83C] transition-colors">Simulador</a>
            <a href="#portfolio" className="hover:text-[#A4E83C] transition-colors">Portfólio</a>
            <a href="#depoimentos" className="hover:text-[#A4E83C] transition-colors">Depoimentos</a>
            <a href="#tecnica" className="hover:text-[#A4E83C] transition-colors">Requisitos</a>
            <a href="/login" className="px-4 py-1.5 rounded-full border border-[#00A9E0]/40 text-[#00A9E0] hover:bg-[#00A9E0] hover:text-black font-bold transition-all">Acessar CRM</a>
          </nav>

          <a
            href="#orcamento"
            className="hidden sm:inline-flex px-6 py-2.5 rounded-full bg-gradient-to-r from-[#A4E83C] to-[#00A9E0] text-black font-extrabold text-sm transition-all hover:scale-105 active:scale-95 duration-300"
            style={{ boxShadow: '0 0 15px rgba(164, 232, 60, 0.3)' }}
          >
            Solicitar Orçamento
          </a>

          {/* Mobile Menu Button */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-2 text-white outline-none cursor-pointer">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16m-7 6h7" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu Panel */}
        {mobileMenuOpen && (
          <div className="lg:hidden absolute top-20 left-0 w-full bg-[#0A0A0A]/95 border-b border-neutral-900 p-6 flex flex-col space-y-4 backdrop-blur-lg">
            <a onClick={() => setMobileMenuOpen(false)} href="#hero" className="text-lg font-medium text-white hover:text-[#A4E83C]">Início</a>
            <a onClick={() => setMobileMenuOpen(false)} href="#servicos" className="text-lg font-medium text-white hover:text-[#A4E83C]">Serviços</a>
            <a onClick={() => setMobileMenuOpen(false)} href="#condominios" className="text-lg font-medium text-white hover:text-[#A4E83C]">Condomínios</a>
            <a onClick={() => setMobileMenuOpen(false)} href="#beneficios" className="text-lg font-medium text-white hover:text-[#A4E83C]">Benefícios</a>
            <a onClick={() => setMobileMenuOpen(false)} href="#calculadora" className="text-lg font-medium text-white hover:text-[#A4E83C]">Simulador</a>
            <a onClick={() => setMobileMenuOpen(false)} href="#portfolio" className="text-lg font-medium text-white hover:text-[#A4E83C]">Portfólio</a>
            <a onClick={() => setMobileMenuOpen(false)} href="#depoimentos" className="text-lg font-medium text-white hover:text-[#A4E83C]">Depoimentos</a>
            <a onClick={() => setMobileMenuOpen(false)} href="#tecnica" className="text-lg font-medium text-white hover:text-[#A4E83C]">Requisitos</a>
            <a onClick={() => setMobileMenuOpen(false)} href="/login" className="text-lg font-medium text-[#00A9E0] hover:text-white">Acessar CRM ➔</a>
            <a
              onClick={() => setMobileMenuOpen(false)}
              href="#orcamento"
              className="py-3 text-center rounded-xl bg-gradient-to-r from-[#A4E83C] to-[#00A9E0] text-black font-extrabold"
            >
              Solicitar Orçamento
            </a>
          </div>
        )}
      </header>

      {/* SEÇÃO 1: HERO */}
      <section id="hero" className="relative min-h-screen flex flex-col items-center justify-center pt-24 px-6 overflow-hidden">
        {/* Dusk Carport Background Visual */}
        <div className="absolute inset-0 z-0">
          <img
            src="/hero_carport_dusk.png"
            alt="Premium EV charging under modern solar carport at dusk"
            className="w-full h-full object-cover opacity-35"
          />
          {/* Gradients to blend background into the dark scheme */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent" />
          <div className="absolute inset-0 bg-radial-gradient(circle_at_center,transparent_20%,#050505_90%)" />
        </div>

        <div className="max-w-6xl mx-auto text-center space-y-10 z-10 pt-12">
          {/* Logo Greentech Charge Highlight */}
          <div className="flex flex-col items-center space-y-4 animate-fade-in">
            {/* Logo Image in Premium Badge (Hero) */}
            <div className="w-40 h-40 md:w-48 md:h-48 rounded-full bg-white flex items-center justify-center overflow-hidden border-2 border-white/20 shadow-[0_0_40px_rgba(0,169,224,0.3)] mx-auto relative group">
              <img
                src="/logo.png"
                alt="Logo Greentech Charge"
                className="w-32 h-32 md:w-36 md:h-36 object-contain transform group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#A4E83C]/35 bg-[#A4E83C]/5 text-[#A4E83C] text-xs md:text-sm font-bold tracking-wider uppercase">
              <span className="w-2.5 h-2.5 rounded-full bg-[#A4E83C] animate-ping" />
              Sustentabilidade que move o futuro
            </div>
          </div>
          
          <div className="space-y-6 max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tighter leading-none text-white">
              O FUTURO É <br className="sm:hidden" />
              <span className="bg-gradient-to-r from-[#A4E83C] via-[#00cba0] to-[#00A9E0] bg-clip-text text-transparent filter drop-shadow-[0_2px_15px_rgba(164,232,60,0.15)]">
                SUSTENTÁVEL.
              </span>
            </h1>
            
            <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-neutral-300">
              CARREGUE SEU CARRO COM ENERGIA SOLAR.
            </h2>
            
            <p className="text-sm md:text-lg text-neutral-450 max-w-2xl mx-auto leading-relaxed">
              Aliamos a inteligência da geração fotovoltaica com a conveniência dos postos de recarga elétrica inteligentes. Economia extrema, autonomia real e impacto zero ao meio ambiente.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6 z-10 relative">
            <a
              href="#orcamento"
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#A4E83C] to-[#00A9E0] text-black font-extrabold rounded-xl transition-all shadow-xl hover:scale-105 duration-300"
              style={{ boxShadow: '0 0 25px rgba(164, 232, 60, 0.4)' }}
            >
              Simular Projeto
            </a>
            <a
              href="#servicos"
              className="w-full sm:w-auto px-8 py-4 bg-neutral-900/60 hover:bg-neutral-800 text-white border border-neutral-800 hover:border-neutral-700 font-extrabold rounded-xl transition-all duration-300 backdrop-blur-sm"
            >
              Saiba Mais ➔
            </a>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-neutral-500 z-10">
          <span className="text-[10px] tracking-[0.3em] uppercase">Rolar para baixo</span>
          <div className="w-6 h-10 border-2 border-neutral-800 rounded-full flex justify-center p-1">
            <span className="w-1.5 h-1.5 bg-[#00A9E0] rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {/* SEÇÃO 2: SERVIÇOS */}
      <section id="servicos" className="py-24 md:py-32 border-t border-neutral-950 relative bg-[#090909]/40 z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
            <span className="text-xs uppercase tracking-[0.4em] text-[#00A9E0] font-bold">Fluxo Inteligente</span>
            <h2 className="text-4xl md:text-5xl font-black text-white leading-tight">
              ENERGIA QUE CONECTA TUDO
            </h2>
            <p className="text-neutral-400 text-base md:text-lg">
              Produza sua própria energia e abasteça seu veículo com muito mais economia.
            </p>
          </div>

          {/* Glowing Diagram Flow */}
          <div className="relative">
            {/* Visual connector lines */}
            <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-gradient-to-r from-[#A4E83C]/20 via-[#00A9E0]/20 to-[#A4E83C]/20 -translate-y-1/2 hidden lg:block z-0">
              {/* Light trails animation */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#A4E83C] to-[#00A9E0] h-full w-24 animate-light-trail" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
              
              {/* Step 1 */}
              <div className="glass-card p-8 rounded-2xl border-white/5 relative group hover:border-[#A4E83C]/30 transition-all duration-300">
                <div className="w-16 h-16 bg-[#A4E83C]/10 rounded-2xl flex items-center justify-center text-[#A4E83C] mb-6 group-hover:scale-115 transition-transform duration-300 shadow-[0_0_15px_rgba(164,232,60,0.1)]">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="5"></circle>
                    <line x1="12" y1="1" x2="12" y2="3"></line>
                    <line x1="12" y1="21" x2="12" y2="23"></line>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                    <line x1="1" y1="12" x2="3" y2="12"></line>
                    <line x1="21" y1="12" x2="23" y2="12"></line>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                  </svg>
                </div>
                <span className="text-[#A4E83C] font-extrabold text-xs tracking-wider">PASSO 01</span>
                <h3 className="text-xl font-bold text-white mt-2 mb-3">ENERGIA DO SOL</h3>
                <p className="text-neutral-450 text-sm leading-relaxed">
                  A luz solar é captada de forma eficiente pelas placas fotovoltaicas instaladas em seu telhado ou carport.
                </p>
              </div>

              {/* Step 2 */}
              <div className="glass-card p-8 rounded-2xl border-white/5 relative group hover:border-[#00A9E0]/30 transition-all duration-300">
                <div className="w-16 h-16 bg-[#00A9E0]/10 rounded-2xl flex items-center justify-center text-[#00A9E0] mb-6 group-hover:scale-115 transition-transform duration-300 shadow-[0_0_15px_rgba(0,169,224,0.1)]">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path d="M3 9h18M3 15h18M9 3v18M15 3v18M4 3h16a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
                  </svg>
                </div>
                <span className="text-[#00A9E0] font-extrabold text-xs tracking-wider">PASSO 02</span>
                <h3 className="text-xl font-bold text-white mt-2 mb-3">GERAÇÃO SOLAR</h3>
                <p className="text-neutral-450 text-sm leading-relaxed">
                  O inversor inteligente converte a energia solar em eletricidade utilizável para sua residência ou empresa.
                </p>
              </div>

              {/* Step 3 */}
              <div className="glass-card p-8 rounded-2xl border-white/5 relative group hover:border-[#A4E83C]/30 transition-all duration-300">
                <div className="w-16 h-16 bg-[#A4E83C]/10 rounded-2xl flex items-center justify-center text-[#A4E83C] mb-6 group-hover:scale-115 transition-transform duration-300 shadow-[0_0_15px_rgba(164,232,60,0.1)]">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <rect x="5" y="2" width="14" height="20" rx="3" />
                    <circle cx="12" cy="17" r="2" fill="currentColor" />
                    <path d="M12 6h.01M9 10h6v4H9z" />
                  </svg>
                </div>
                <span className="text-[#A4E83C] font-extrabold text-xs tracking-wider">PASSO 03</span>
                <h3 className="text-xl font-bold text-white mt-2 mb-3">CARREGAMENTO INTELIGENTE</h3>
                <p className="text-neutral-450 text-sm leading-relaxed">
                  A Wallbox modula e gerencia o envio de corrente de forma automatizada e protegida até o veículo.
                </p>
              </div>

              {/* Step 4 */}
              <div className="glass-card p-8 rounded-2xl border-white/5 relative group hover:border-[#00A9E0]/30 transition-all duration-300">
                <div className="w-16 h-16 bg-[#00A9E0]/10 rounded-2xl flex items-center justify-center text-[#00A9E0] mb-6 group-hover:scale-115 transition-transform duration-300 shadow-[0_0_15px_rgba(0,169,224,0.1)]">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.8A2 2 0 0 0 2 11.6V16c0 .6.4 1 1 1h2M7 21a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM17 21a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
                  </svg>
                </div>
                <span className="text-[#00A9E0] font-extrabold text-xs tracking-wider">PASSO 04</span>
                <h3 className="text-xl font-bold text-white mt-2 mb-3">MOBILIDADE ELÉTRICA</h3>
                <p className="text-neutral-450 text-sm leading-relaxed">
                  Seu carro é abastecido com eletricidade verde de baixíssimo custo, pronto para rodar com autonomia total.
                </p>
              </div>

            </div>
          </div>

          <div className="mt-16 text-center">
            <span className="inline-block py-2 px-6 rounded-full bg-neutral-900 border border-neutral-800 text-sm font-bold text-white">
              ENERGIA LIMPA, INTELIGENTE E <span className="text-[#A4E83C]">SUSTENTÁVEL.</span>
            </span>
          </div>
        </div>
      </section>

      {/* SEÇÃO 3: SOLUÇÕES PARA CONDOMÍNIOS */}
      <section id="condominios" className="py-24 md:py-32 border-t border-neutral-950 relative z-10 bg-black/60">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            
            {/* Visual Image / Info on the Left */}
            <div className="lg:col-span-5 space-y-8">
              <div className="relative group rounded-3xl overflow-hidden shadow-2xl border border-neutral-800 bg-[#0E0E0E]">
                {/* Visual Glow behind image */}
                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent z-10 pointer-events-none" />
                <img
                  src="/condo_ev_charging.png"
                  alt="Condominium EV Charging Station"
                  className="w-full h-auto object-cover opacity-85 group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="space-y-4">
                <span className="text-xs uppercase tracking-[0.45em] text-[#A4E83C] font-bold">Serviço Ponta a Ponta</span>
                <h3 className="text-2xl font-extrabold text-white">Pronto para qualquer desafio</h3>
                <p className="text-neutral-450 text-sm leading-relaxed">
                  A Greentech desenvolve projetos integrados. Oferecemos estudo de viabilidade técnica das garagens, dimensionamento elétrico com tecnologia de ponta, adequação física e suporte continuado.
                </p>
                <div className="grid grid-cols-3 gap-4 pt-2">
                  <div className="bg-neutral-900/60 border border-neutral-800/60 p-4 rounded-xl text-center">
                    <span className="block text-[#A4E83C] text-lg font-black leading-none mb-1">01</span>
                    <span className="text-[10px] uppercase font-bold text-neutral-400">Análise</span>
                  </div>
                  <div className="bg-neutral-900/60 border border-neutral-800/60 p-4 rounded-xl text-center">
                    <span className="block text-[#00A9E0] text-lg font-black leading-none mb-1">02</span>
                    <span className="text-[10px] uppercase font-bold text-neutral-400">Projeto</span>
                  </div>
                  <div className="bg-neutral-900/60 border border-neutral-800/60 p-4 rounded-xl text-center">
                    <span className="block text-[#A4E83C] text-lg font-black leading-none mb-1">03</span>
                    <span className="text-[10px] uppercase font-bold text-neutral-400">Instalação</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Accordion / FAQ on the Right */}
            <div className="lg:col-span-7 space-y-8">
              <div>
                <span className="text-xs uppercase tracking-[0.4em] text-[#00A9E0] font-bold">Hub de Respostas</span>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight mt-2 leading-tight">
                  SEU CONDOMÍNIO ESTÁ PREPARADO PARA A MOBILIDADE ELÉTRICA?
                </h2>
                <p className="text-neutral-440 mt-4 leading-relaxed">
                  Instalar carregadores em garagens coletivas exige técnica, segurança jurídica e conformidade com normas estritas. Esclareça as principais dúvidas de síndicos e condôminos:
                </p>
              </div>

              {/* Accordion List */}
              <div className="space-y-4 pt-4">
                {faqs.map((faq, index) => {
                  const isOpen = activeFaq === index;
                  return (
                    <div
                      key={index}
                      className={`rounded-2xl border transition-all duration-300 ${isOpen ? 'border-[#00A9E0]/45 bg-[#0e0e0e]/80 shadow-[0_5px_20px_-10px_rgba(0,169,224,0.15)]' : 'border-neutral-900 bg-neutral-950/40 hover:border-neutral-800'}`}
                    >
                      <button
                        onClick={() => toggleFaq(index)}
                        className="w-full flex items-center justify-between px-6 py-5 text-left font-bold text-base md:text-lg text-white cursor-pointer select-none outline-none"
                      >
                        <span className="pr-4">{faq.question}</span>
                        <span className={`p-1.5 rounded-full border transition-transform duration-300 ${isOpen ? 'border-[#A4E83C]/30 text-[#A4E83C] rotate-180 bg-[#A4E83C]/5' : 'border-neutral-800 text-neutral-500'}`}>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                          </svg>
                        </span>
                      </button>
                      
                      <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'}`}>
                        <div className="px-6 pb-6 text-sm md:text-base text-neutral-450 leading-relaxed border-t border-neutral-900/60 pt-4">
                          {faq.answer}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SEÇÃO 4: BENEFÍCIOS */}
      <section id="beneficios" className="py-24 md:py-32 border-t border-neutral-950 bg-gradient-to-b from-[#050505] to-[#0A0A0A] relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
            <span className="text-xs uppercase tracking-[0.4em] text-[#A4E83C] font-bold">Vantagens Reais</span>
            <h2 className="text-4xl md:text-5xl font-black text-white">BENEFÍCIOS QUE VOCÊ SENTE NO DIA A DIA</h2>
            <p className="text-neutral-400">
              Economia, sustentabilidade e inovação integradas no seu cotidiano.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Benefício 1 */}
            <div className="glass-card glass-card-hover p-8 md:p-10 rounded-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#A4E83C]/5 to-transparent rounded-bl-3xl pointer-events-none" />
              <div className="w-14 h-14 bg-[#A4E83C]/10 rounded-xl flex items-center justify-center text-[#A4E83C] mb-8 group-hover:scale-110 transition-transform duration-300 shadow-[0_0_15px_rgba(164,232,60,0.1)]">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
                </svg>
              </div>
              <h3 className="text-xl md:text-2xl font-black text-white mb-4">REDUÇÃO NO CUSTO DA RECARGA</h3>
              <p className="text-neutral-450 text-sm md:text-base leading-relaxed">
                Carregar seu veículo elétrico utilizando a energia solar autogerada custa até 90% menos do que combustíveis fósseis ou energia comprada diretamente das distribuidoras urbanas. Retorno de investimento acelerado.
              </p>
            </div>

            {/* Benefício 2 */}
            <div className="glass-card glass-card-hover p-8 md:p-10 rounded-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#00A9E0]/5 to-transparent rounded-bl-3xl pointer-events-none" />
              <div className="w-14 h-14 bg-[#00A9E0]/10 rounded-xl flex items-center justify-center text-[#00A9E0] mb-8 group-hover:scale-110 transition-transform duration-300 shadow-[0_0_15px_rgba(0,169,224,0.1)]">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
                </svg>
              </div>
              <h3 className="text-xl md:text-2xl font-black text-white mb-4">ENERGIA RENOVÁVEL</h3>
              <p className="text-neutral-450 text-sm md:text-base leading-relaxed">
                A sustentabilidade na sua forma mais pura. Ao integrar seu veículo à geração fotovoltaica, você garante o consumo de uma energia 100% limpa, sem dependência de termoelétricas ou fontes não renováveis.
              </p>
            </div>

            {/* Benefício 3 */}
            <div className="glass-card glass-card-hover p-8 md:p-10 rounded-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#00A9E0]/5 to-transparent rounded-bl-3xl pointer-events-none" />
              <div className="w-14 h-14 bg-[#00A9E0]/10 rounded-xl flex items-center justify-center text-[#00A9E0] mb-8 group-hover:scale-110 transition-transform duration-300 shadow-[0_0_15px_rgba(0,169,224,0.1)]">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2zm0 0V9a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v10m-6 0a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2m0 0V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v14a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2z" />
                </svg>
              </div>
              <h3 className="text-xl md:text-2xl font-black text-white mb-4">MOBILIDADE INTELIGENTE</h3>
              <p className="text-neutral-450 text-sm md:text-base leading-relaxed">
                Nossos sistemas contam com automação IoT. Acompanhe a velocidade de recarga, agende os horários com tarifas de menor custo e acompanhe relatórios de consumo direto no celular ou painel de gestão.
              </p>
            </div>

            {/* Benefício 4 */}
            <div className="glass-card glass-card-hover p-8 md:p-10 rounded-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#A4E83C]/5 to-transparent rounded-bl-3xl pointer-events-none" />
              <div className="w-14 h-14 bg-[#A4E83C]/10 rounded-xl flex items-center justify-center text-[#A4E83C] mb-8 group-hover:scale-110 transition-transform duration-300 shadow-[0_0_15px_rgba(164,232,60,0.1)]">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 0 0 1 1h3m10-11l2 2m-2-2v10a1 1 0 0 1-1 1h-3m-6 0a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1m-6 0h6" />
                </svg>
              </div>
              <h3 className="text-xl md:text-2xl font-black text-white mb-4">VALORIZAÇÃO DO IMÓVEL</h3>
              <p className="text-neutral-450 text-sm md:text-base leading-relaxed">
                Garagens de condomínios residenciais e comerciais equipadas com infraestrutura inteligente de carregamento elétrico e coberturas com painéis solares têm valorização de patrimônio acima da média de mercado.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* SEÇÃO SIMULADOR DE ECONOMIA */}
      <section id="calculadora" className="py-24 md:py-32 border-t border-neutral-950 bg-[#070707] relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="text-xs uppercase tracking-[0.4em] text-[#00A9E0] font-bold">Simulação em Tempo Real</span>
            <h2 className="text-4xl md:text-5xl font-black text-white">SIMULADOR DE ECONOMIA</h2>
            <p className="text-neutral-400">
              Descubra quanto você pode economizar migrando para a energia solar e abastecendo seu carro elétrico com a Greentech.
            </p>
          </div>

          <EconomyCalculator />
        </div>
      </section>

      {/* SEÇÃO PORTFÓLIO: SERVIÇOS JÁ FEITOS */}
      <section id="portfolio" className="py-24 md:py-32 border-t border-neutral-950 bg-[#0c0c0c]/80 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
            <span className="text-xs uppercase tracking-[0.4em] text-[#A4E83C] font-bold">Casos de Sucesso</span>
            <h2 className="text-4xl md:text-5xl font-black text-white leading-tight">
              NOSSOS PROJETOS ENTREGUES
            </h2>
            <p className="text-neutral-400 text-base md:text-lg">
              Veja de perto a qualidade e sofisticação das instalações executadas pelo Grupo Greentech.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {portfolio.length > 0 ? (
              portfolio.map((project) => (
                <div key={project.id} className="glass-card rounded-3xl overflow-hidden group border border-white/5 hover:border-[#00A9E0]/30 transition-all duration-300">
                  <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-[#0A0A0A]">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent z-10" />
                    <img
                      src={project.imageUrl}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                    />
                    <span className="absolute top-4 left-4 z-20 px-3.5 py-1.5 rounded-full bg-[#00A9E0]/15 border border-[#00A9E0]/30 text-[#00A9E0] text-[10px] font-bold uppercase tracking-wider">
                      {project.category}
                    </span>
                  </div>
                  <div className="p-8 space-y-4">
                    <h3 className="text-xl font-bold text-white leading-tight group-hover:text-[#A4E83C] transition-colors">{project.title}</h3>
                    <p className="text-neutral-450 text-sm leading-relaxed">{project.description}</p>
                    <div className="pt-2 border-t border-neutral-900 flex justify-between items-center text-xs text-neutral-400 font-bold uppercase tracking-wider">
                      <span>Cliente: {project.clientName}</span>
                      <span className="text-[#00A9E0]">{project.location}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="col-span-2 text-center text-neutral-500 py-10 italic">Nenhum projeto cadastrado no momento.</p>
            )}
          </div>
        </div>
      </section>

      {/* SEÇÃO DEPOIMENTOS DE CLIENTES */}
      <section id="depoimentos" className="py-24 md:py-32 border-t border-neutral-950 bg-black/60 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
            <span className="text-xs uppercase tracking-[0.4em] text-[#00A9E0] font-bold">Feedback dos Clientes</span>
            <h2 className="text-4xl md:text-5xl font-black text-white leading-tight">
              O QUE DIZEM SOBRE A GREENTECH
            </h2>
            <p className="text-neutral-400 text-base md:text-lg">
              A satisfação dos nossos clientes é a nossa melhor credencial de qualidade e segurança.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.length > 0 ? (
              testimonials.map((test) => (
                <div key={test.id} className="glass-card p-8 md:p-10 rounded-3xl border border-white/5 relative overflow-hidden group hover:border-[#A4E83C]/20 transition-all duration-300">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-[#A4E83C]/5 to-transparent rounded-bl-3xl pointer-events-none" />
                  
                  {/* Rating Stars */}
                  <div className="flex gap-1 mb-6">
                    {Array.from({ length: test.rating }).map((_, i) => (
                      <span key={i} className="text-[#A4E83C] text-lg">★</span>
                    ))}
                  </div>

                  <p className="text-neutral-350 text-sm md:text-base italic leading-relaxed mb-6 text-neutral-300">
                    "{test.comment}"
                  </p>

                  <div className="pt-4 border-t border-neutral-900/60 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00A9E0] to-[#A4E83C] flex items-center justify-center text-black font-extrabold text-sm shrink-0">
                      {test.clientName.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-white text-sm md:text-base">{test.clientName}</h4>
                      <span className="text-neutral-450 text-xs">{test.role}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="col-span-2 text-center text-neutral-500 py-10 italic">Nenhum depoimento cadastrado no momento.</p>
            )}
          </div>
        </div>
      </section>

      {/* SEÇÃO 5: TÉCNICA E REQUISITOS */}
      <section id="tecnica" className="py-24 md:py-32 border-t border-neutral-950 relative z-10 bg-[#070C14]">
        {/* Subtle Cyan Lights */}
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[#00A9E0]/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            
            {/* Checklist Section on Left */}
            <div className="lg:col-span-7 space-y-8">
              <div>
                <span className="text-xs uppercase tracking-[0.45em] text-[#00A9E0] font-bold">Especificações</span>
                <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mt-2">
                  O QUE PRECISA SER ANALISADO?
                </h2>
                <p className="text-neutral-400 mt-4 leading-relaxed">
                  Antes de ligar o carregador veicular na tomada, nossa equipe realiza um diagnóstico aprofundado dos requisitos técnicos. Isso garante proteção aos aparelhos do imóvel e segurança integral:
                </p>
              </div>

              {/* Grid of Checklist Items */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                {checklistItems.map((item, index) => (
                  <div key={index} className="bg-neutral-950/60 border border-neutral-900 hover:border-[#00A9E0]/20 p-5 rounded-xl transition-all duration-300 flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-[#00A9E0]/10 text-[#00A9E0] mt-0.5 shadow-[0_0_10px_rgba(0,169,224,0.05)]">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-extrabold text-white text-sm md:text-base">{item.title}</h4>
                      <p className="text-neutral-450 text-xs md:text-sm mt-1 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Panel on Right (Visual High-Tech Box) */}
            <div className="lg:col-span-5">
              <div className="relative p-1 rounded-3xl bg-gradient-to-br from-[#A4E83C]/30 via-neutral-900 to-[#00A9E0]/30 shadow-2xl glow-cyan/10">
                <div className="bg-[#0b0f19] rounded-[22px] p-8 md:p-10 space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
                    <span className="text-xs uppercase font-extrabold tracking-widest text-[#00A9E0]">Importância da Análise</span>
                  </div>
                  
                  <h3 className="text-2xl font-black text-white leading-tight">
                    Por que não fazer sem um especialista?
                  </h3>
                  
                  <p className="text-neutral-400 text-sm leading-relaxed">
                    Carregadores rápidos (Wallbox) demandam potências elevadas de 7.4 kW a 22 kW. Conectar sem proteção dedicada e dimensionamento de cabos adequado gera perigo real de superaquecimento, queima de aparelhos residenciais e queda do disjuntor geral do imóvel.
                  </p>

                  <div className="p-4 bg-black/40 rounded-xl border border-neutral-800 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[#A4E83C] text-sm">⚠</span>
                      <span className="text-xs font-bold text-white uppercase tracking-wider">Atenção Síndicos</span>
                    </div>
                    <p className="text-xs text-neutral-450 leading-relaxed">
                      Projetos em conformidade com as regras previnem a responsabilidade civil do gestor perante eventuais sinistros.
                    </p>
                  </div>

                  <a
                    href="#orcamento"
                    className="block text-center w-full py-4 bg-gradient-to-r from-[#A4E83C] to-[#00A9E0] text-black font-extrabold rounded-xl text-sm transition-transform hover:scale-[1.02]"
                  >
                    Agendar Avaliação Gratuita
                  </a>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SEÇÃO 6: CALL TO ACTION (CTA) E CONTATO */}
      <section id="orcamento" className="py-24 md:py-32 border-t border-neutral-950 relative overflow-hidden z-10 bg-[#050505]">
        {/* Subtle Background Carport Overlay */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[#050505]/85 z-10" />
          <img
            src="/hero_carport_dusk.png"
            alt="Solar carport at dusk"
            className="w-full h-full object-cover opacity-20"
          />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            
            {/* Info on Left */}
            <div className="lg:col-span-6 space-y-10">
              <div className="space-y-4">
                <span className="text-xs uppercase tracking-[0.45em] text-[#A4E83C] font-bold">Orçamento Imediato</span>
                <h2 className="text-4xl md:text-5xl font-black text-white leading-tight">
                  SOLICITE SEU ORÇAMENTO
                </h2>
                <p className="text-neutral-400 text-base md:text-lg max-w-lg leading-relaxed">
                  Fale com nossos engenheiros e técnicos parceiros para dimensionar o projeto de energia solar ou estação de recarga ideal para sua necessidade.
                </p>
              </div>

              {/* Regional Contacts List */}
              <div className="space-y-6">
                
                {/* Florianópolis */}
                <div className="flex items-start gap-4">
                  <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 text-[#A4E83C] mt-1 shadow-lg shadow-black/50">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-xs uppercase tracking-widest text-[#00A9E0] font-bold">Florianópolis e Região</h4>
                    <a
                      href="https://wa.me/5548991948635"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-lg font-black text-white hover:text-[#A4E83C] transition-colors block mt-1"
                    >
                      (48) 99194-8635
                    </a>
                  </div>
                </div>


                {/* Instagram */}
                <div className="flex items-start gap-4">
                  <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 text-[#A4E83C] mt-1 shadow-lg shadow-black/50">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-xs uppercase tracking-widest text-[#00A9E0] font-bold">Siga no Instagram</h4>
                    <a
                      href="https://instagram.com/greentechcharge"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-lg font-black text-white hover:text-[#A4E83C] transition-colors block mt-1"
                    >
                      @greentechcharge
                    </a>
                  </div>
                </div>

              </div>
            </div>

            {/* Glassmorphic Form on Right */}
            <div className="lg:col-span-6">
              <div className="glass-card rounded-3xl p-8 md:p-10 shadow-2xl relative overflow-hidden border border-white/10 glow-green/5">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#A4E83C] to-[#00A9E0]" />
                
                <h3 className="text-2xl font-black text-white mb-2">Fale com um especialista</h3>
                <p className="text-xs text-neutral-400 mb-6 uppercase tracking-wider">Responderemos sua análise em até 24 horas úteis</p>

                {/* Render the Lead Capture Form Component */}
                <LeadForm />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SEÇÃO CRM PORTAL / ACESSO DO CLIENTE */}
      <section className="py-16 bg-[#030303] border-t border-neutral-950 relative z-10 text-center">
        <div className="max-w-4xl mx-auto px-6 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#00A9E0]/30 bg-[#00A9E0]/5 text-[#00A9E0] text-xs font-bold uppercase tracking-wider">
            ⚙️ Área Restrita
          </div>
          <h2 className="text-3xl font-black text-white">PAINEL DE CONTROLE INTERNO</h2>
          <p className="text-sm text-neutral-450 max-w-xl mx-auto leading-relaxed">
            Se você é colaborador da Greentech, acesse o sistema de gerenciamento de leads, visitas técnicas e ordens de serviço.
          </p>
          <div className="pt-2">
            <a
              href="/login"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl border border-[#A4E83C]/40 text-[#A4E83C] hover:bg-[#A4E83C] hover:text-black font-extrabold text-sm transition-all duration-300 shadow-lg shadow-[#A4E83C]/5"
            >
              Acessar CRM do Grupo Greentech ➔
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-950 bg-[#020202] py-12 relative z-10 text-center text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto px-6 space-y-4">
          <p>© 2026 Grupo Greentech. Todos os direitos reservados. Instalação e Integração de Mobilidade Verde.</p>
          <div className="flex justify-center space-x-6 text-neutral-600 flex-wrap gap-y-2">
            <a href="#hero" className="hover:text-white transition-colors">Início</a>
            <span>•</span>
            <a href="#servicos" className="hover:text-white transition-colors">Serviços</a>
            <span>•</span>
            <a href="#condominios" className="hover:text-white transition-colors">Condomínios</a>
            <span>•</span>
            <a href="#beneficios" className="hover:text-white transition-colors">Benefícios</a>
            <span>•</span>
            <a href="#calculadora" className="hover:text-white transition-colors">Simulador</a>
            <span>•</span>
            <a href="#portfolio" className="hover:text-white transition-colors">Portfólio</a>
            <span>•</span>
            <a href="#depoimentos" className="hover:text-white transition-colors">Depoimentos</a>
            <span>•</span>
            <a href="/login" className="hover:text-white transition-colors font-bold text-[#A4E83C]">Acessar CRM</a>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp Button */}
      <WhatsAppButton />
    </div>
  );
}
