'use client';

import React, { useState } from 'react';

interface EconomyCalculatorProps {
  initialTab?: 'solar' | 'ev';
}

export default function EconomyCalculator({ initialTab = 'solar' }: EconomyCalculatorProps) {
  const [activeTab, setActiveTab] = useState<'solar' | 'ev'>(initialTab);

  React.useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash === '#calculadora-solar') {
        setActiveTab('solar');
      } else if (hash === '#calculadora-ev') {
        setActiveTab('ev');
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Solar States
  const [contaMensal, setContaMensal] = useState<number>(800); // R$

  // EV States
  const [kmMensal, setKmMensal] = useState<number>(1500); // km
  const [precoGasolina, setPrecoGasolina] = useState<number>(5.85); // R$/L

  // Solar Calculations
  const tarifaKwh = 0.95; // R$ médio em SC
  const consumoKwh = contaMensal / tarifaKwh;
  const economiaMensalSolar = contaMensal * 0.90; // 90% de economia
  const economiaAnualSolar = economiaMensalSolar * 12;
  
  // Amortização aproximada: R$ 3800 por kWp necessário. 
  // 1 kWp produz aprox. 125 kWh/mês em SC.
  const kwpNecessario = consumoKwh / 125;
  const custoEstimadoSolar = kwpNecessario * 3900; 
  const tempoRetornoAnos = economiaAnualSolar > 0 ? custoEstimadoSolar / economiaAnualSolar : 0;

  // EV Calculations
  const consumoMedioKwh = 6; // 6 km por kWh (média de VEs)
  const consumoMedioGasolina = 10; // 10 km por litro
  
  const custoGasolinaMensal = (kmMensal / consumoMedioGasolina) * precoGasolina;
  const kwhNecessarioEV = kmMensal / consumoMedioKwh;
  
  // Recarga na rede (sem solar) vs Recarga Solar Greentech (R$ 0,15 de custo de amortização/geração)
  const custoRecargaRede = kwhNecessarioEV * tarifaKwh;
  const custoRecargaSolar = kwhNecessarioEV * 0.15;
  
  const economiaEVRede = custoGasolinaMensal - custoRecargaRede;
  const economiaEVSolar = custoGasolinaMensal - custoRecargaSolar;

  // Eco impact (Solar + EV)
  const co2EvitadoSolar = (consumoKwh * 12 * 0.12); // 0.12 kg CO2 por kWh solar
  const arvoresSalvasSolar = co2EvitadoSolar / 7; // Uma árvore absorve ~7kg CO2/ano

  return (
    <div className="glass-card rounded-3xl p-8 md:p-12 border border-white/10 relative overflow-hidden shadow-2xl glow-cyan/5">
      {/* Visual Accent gradient lines */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#A4E83C] to-[#00A9E0]" />
      
      {/* Tabs / Switcher */}
      <div className="flex flex-col sm:flex-row justify-center items-center mb-10">
        <div className="bg-black/90 border border-neutral-800/90 p-2 rounded-2xl flex flex-col sm:flex-row gap-2 shadow-2xl backdrop-blur-xl">
          <button
            id="btn-tab-solar"
            onClick={() => {
              setActiveTab('solar');
              window.history.replaceState(null, '', '#calculadora-solar');
            }}
            className={`px-7 py-3.5 rounded-xl text-xs md:text-sm font-black uppercase tracking-wider transition-all duration-300 cursor-pointer flex items-center justify-center gap-2.5 ${
              activeTab === 'solar'
                ? 'bg-gradient-to-r from-[#A4E83C] to-[#00A9E0] text-black shadow-[0_0_25px_rgba(164,232,60,0.4)] scale-105 ring-2 ring-[#A4E83C]/30'
                : 'text-neutral-400 hover:text-white bg-neutral-900/60 hover:bg-neutral-800/80 border border-transparent hover:border-neutral-700'
            }`}
          >
            <span className="text-base">☀️</span>
            <span>Calculadora Energia Solar</span>
          </button>
          <button
            id="btn-tab-ev"
            onClick={() => {
              setActiveTab('ev');
              window.history.replaceState(null, '', '#calculadora-ev');
            }}
            className={`px-7 py-3.5 rounded-xl text-xs md:text-sm font-black uppercase tracking-wider transition-all duration-300 cursor-pointer flex items-center justify-center gap-2.5 ${
              activeTab === 'ev'
                ? 'bg-gradient-to-r from-[#A4E83C] to-[#00A9E0] text-black shadow-[0_0_25px_rgba(0,169,224,0.4)] scale-105 ring-2 ring-[#00A9E0]/30'
                : 'text-neutral-400 hover:text-white bg-neutral-900/60 hover:bg-neutral-800/80 border border-transparent hover:border-neutral-700'
            }`}
          >
            <span className="text-base">⚡</span>
            <span>Calculadora Carregamento Veicular</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Inputs (Left) */}
        <div className="lg:col-span-6 space-y-8">
          {activeTab === 'solar' ? (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl md:text-2xl font-black text-white">Simule sua Geração Solar</h3>
                <p className="text-xs text-neutral-400 mt-1">Ajuste o valor gasto na sua conta de luz residencial ou comercial.</p>
              </div>

              {/* Slider conta de luz */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-300 font-bold uppercase tracking-wider">Gasto Mensal com Energia</span>
                  <span className="text-2xl font-black text-[#A4E83C]">
                    R$ {contaMensal.toLocaleString('pt-BR')}
                  </span>
                </div>
                <input
                  type="range"
                  min="150"
                  max="10000"
                  step="50"
                  value={contaMensal}
                  onChange={(e) => setContaMensal(Number(e.target.value))}
                  className="w-full h-2 bg-neutral-900 rounded-lg appearance-none cursor-pointer accent-[#A4E83C] focus:outline-none"
                  style={{
                    background: `linear-gradient(to right, #A4E83C 0%, #A4E83C ${((contaMensal - 150) / 9850) * 100}%, #171717 ${((contaMensal - 150) / 9850) * 100}%, #171717 100%)`
                  }}
                />
                <div className="flex justify-between text-[10px] text-neutral-500 font-semibold">
                  <span>R$ 150</span>
                  <span>R$ 5.000</span>
                  <span>R$ 10.000</span>
                </div>
              </div>

              {/* Helper Information */}
              <div className="p-4 rounded-xl bg-black/40 border border-neutral-900/60 text-xs text-neutral-400 leading-relaxed">
                ℹ️ Consideramos a tarifa média da concessionária de <strong className="text-white">R$ {tarifaKwh.toFixed(2)}/kWh</strong> com impostos inclusos para a região de Santa Catarina.
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl md:text-2xl font-black text-white">Abasteça seu Carro com o Sol</h3>
                <p className="text-xs text-neutral-400 mt-1">Compare o custo do combustível fóssil com a recarga inteligente da Greentech.</p>
              </div>

              {/* Slider Km Rodados */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-300 font-bold uppercase tracking-wider">Km Rodados por Mês</span>
                  <span className="text-2xl font-black text-[#00A9E0]">
                    {kmMensal.toLocaleString('pt-BR')} km
                  </span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="8000"
                  step="100"
                  value={kmMensal}
                  onChange={(e) => setKmMensal(Number(e.target.value))}
                  className="w-full h-2 bg-neutral-900 rounded-lg appearance-none cursor-pointer accent-[#00A9E0] focus:outline-none"
                  style={{
                    background: `linear-gradient(to right, #00A9E0 0%, #00A9E0 ${((kmMensal - 500) / 7500) * 100}%, #171717 ${((kmMensal - 500) / 7500) * 100}%, #171717 100%)`
                  }}
                />
                <div className="flex justify-between text-[10px] text-neutral-500 font-semibold">
                  <span>500 km</span>
                  <span>4.000 km</span>
                  <span>8.000 km</span>
                </div>
              </div>

              {/* Slider Preço Gasolina */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-300 font-bold uppercase tracking-wider">Preço da Gasolina (R$ / Litro)</span>
                  <span className="text-xl font-black text-white">
                    R$ {precoGasolina.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min="4.50"
                  max="8.00"
                  step="0.05"
                  value={precoGasolina}
                  onChange={(e) => setPrecoGasolina(Number(e.target.value))}
                  className="w-full h-2 bg-neutral-900 rounded-lg appearance-none cursor-pointer accent-[#00A9E0] focus:outline-none"
                  style={{
                    background: `linear-gradient(to right, #00A9E0 0%, #00A9E0 ${((precoGasolina - 4.50) / 3.50) * 100}%, #171717 ${((precoGasolina - 4.50) / 3.50) * 100}%, #171717 100%)`
                  }}
                />
                <div className="flex justify-between text-[10px] text-neutral-500 font-semibold">
                  <span>R$ 4,50</span>
                  <span>R$ 6,25</span>
                  <span>R$ 8,00</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Outputs / Results (Right) */}
        <div className="lg:col-span-6">
          <div className="p-8 rounded-3xl bg-[#090D14]/85 border border-[#00A9E0]/15 space-y-8 relative overflow-hidden shadow-2xl">
            {/* Ambient Background decoration */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#00A9E0]/10 rounded-full blur-2xl" />
            
            {activeTab === 'solar' ? (
              <div className="space-y-6">
                <div>
                  <span className="text-xs uppercase font-extrabold tracking-widest text-[#00A9E0]">Seus Resultados</span>
                  <h4 className="text-xl font-black text-white mt-1">Economia Projetada</h4>
                </div>

                {/* Economia Mensal */}
                <div className="p-4 bg-black/40 rounded-2xl border border-neutral-900/60 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-neutral-400 font-bold uppercase block">Economia Mensal (90%)</span>
                    <span className="text-2xl font-black text-[#A4E83C] block mt-1">
                      R$ {economiaMensalSolar.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-neutral-400 font-bold uppercase block">Economia Anual</span>
                    <span className="text-lg font-black text-white block mt-1">
                      R$ {economiaAnualSolar.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </span>
                  </div>
                </div>

                {/* Retorno Financeiro / Payback */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-neutral-900/40 border border-neutral-800/60 rounded-xl">
                    <span className="text-[10px] text-neutral-450 uppercase font-extrabold block">Tempo de Payback</span>
                    <span className="text-xl font-black text-white block mt-1">
                      {tempoRetornoAnos.toFixed(1)} <span className="text-xs text-[#00A9E0]">Anos</span>
                    </span>
                  </div>
                  <div className="p-4 bg-neutral-900/40 border border-neutral-800/60 rounded-xl">
                    <span className="text-[10px] text-neutral-450 uppercase font-extrabold block">Investimento Estimado</span>
                    <span className="text-xl font-black text-white block mt-1">
                      R$ {custoEstimadoSolar.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </span>
                  </div>
                </div>

                {/* Eco footprint */}
                <div className="p-4 bg-[#A4E83C]/5 border border-[#A4E83C]/10 rounded-2xl flex items-center gap-4">
                  <div className="w-10 h-10 bg-[#A4E83C]/10 rounded-full flex items-center justify-center text-[#A4E83C] shrink-0">
                    🌱
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white uppercase block">Preservação Ambiental</span>
                    <p className="text-[11px] text-neutral-400 leading-relaxed mt-1">
                      Sua usina poupará <strong className="text-[#A4E83C]">{co2EvitadoSolar.toFixed(0)} kg de CO2/ano</strong>, equivalendo ao plantio de <strong className="text-[#A4E83C]">{Math.ceil(arvoresSalvasSolar)} árvores</strong> por ano.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <span className="text-xs uppercase font-extrabold tracking-widest text-[#00A9E0]">Seus Resultados</span>
                  <h4 className="text-xl font-black text-white mt-1">Comparativo de Custos</h4>
                </div>

                {/* Comparison Bar */}
                <div className="space-y-4">
                  {/* Combustao */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-neutral-400">
                      <span>CARRO A COMBUSTÃO (GASOLINA)</span>
                      <span className="text-white">R$ {custoGasolinaMensal.toFixed(0)} / mês</span>
                    </div>
                    <div className="w-full h-3 bg-neutral-900 rounded-full overflow-hidden">
                      <div className="h-full bg-rose-500/80 w-full" />
                    </div>
                  </div>

                  {/* EV Rede */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-neutral-400">
                      <span>VE COM RECARGA CONCESSIONÁRIA</span>
                      <span className="text-[#00A9E0]">R$ {custoRecargaRede.toFixed(0)} / mês</span>
                    </div>
                    <div className="w-full h-3 bg-neutral-900 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#00A9E0] transition-all duration-500"
                        style={{ width: `${(custoRecargaRede / custoGasolinaMensal) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* EV Solar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-[#A4E83C]">
                      <span>VE COM ENERGIA SOLAR GREENTECH</span>
                      <span>R$ {custoRecargaSolar.toFixed(0)} / mês</span>
                    </div>
                    <div className="w-full h-3 bg-neutral-900 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#A4E83C] to-[#00A9E0] transition-all duration-500"
                        style={{ width: `${(custoRecargaSolar / custoGasolinaMensal) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Economia EV */}
                <div className="p-4 bg-black/40 rounded-2xl border border-neutral-900/60 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-neutral-455 font-bold uppercase block">Economia Mensal (Solar vs Gasolina)</span>
                    <span className="text-2xl font-black text-[#A4E83C] block mt-1">
                      R$ {economiaEVSolar.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-neutral-455 font-bold uppercase block">Economia Anual</span>
                    <span className="text-lg font-black text-white block mt-1">
                      R$ {(economiaEVSolar * 12).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </span>
                  </div>
                </div>

                {/* CTA inside output */}
                <div className="text-xs text-neutral-400 bg-neutral-900/40 p-3 rounded-lg border border-neutral-800/50">
                  ⚡ Carregar com energia solar gerada pelo carport Greentech custa apenas <strong className="text-white">R$ 0,15 por kWh</strong>, reduzindo o custo por km rodado a quase zero.
                </div>
              </div>
            )}

            {/* Simulated project button */}
            <a
              href="#orcamento"
              className="block text-center w-full py-4 mt-4 bg-gradient-to-r from-[#A4E83C] to-[#00A9E0] hover:brightness-110 active:scale-[0.99] text-black font-extrabold rounded-xl text-sm transition-all duration-300"
            >
              Garantir Minha Economia ➔
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
