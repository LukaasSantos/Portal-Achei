'use client';

import React, { useState, useEffect, useRef } from 'react';
import { mockDb, Client, FormSubmission } from '@/lib/mockDb';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, CheckCircle2, ChevronDown, Search, Trash2, Send, X, ClipboardCheck, Database, Plus, ChevronLeft, ChevronRight } from 'lucide-react';

export default function EnviarRelatorioPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [month, setMonth] = useState('');
  const [activeLeadIndex, setActiveLeadIndex] = useState(0);

  interface FormLead {
    id: string;
    contactDate: string;
    name: string;
    phone: string;
    campaign: string;
    sold: 'Sim' | 'Não' | 'Em Andamento';
    whyNotSold: string;
  }

  // --- Form fields ---
  // Validação dos Leads (One or more leads)
  const [leads, setLeads] = useState<FormLead[]>([
    {
      id: 'l_init_' + Math.random().toString(36).substring(2, 9),
      contactDate: '',
      name: '',
      phone: '',
      campaign: '',
      sold: 'Em Andamento',
      whyNotSold: ''
    }
  ]);

  const handleAddLeadField = () => {
    setLeads([
      ...leads,
      {
        id: 'l_' + Math.random().toString(36).substring(2, 9),
        contactDate: new Date().toISOString().split('T')[0],
        name: '',
        phone: '',
        campaign: '',
        sold: 'Em Andamento',
        whyNotSold: ''
      }
    ]);
    setActiveLeadIndex(leads.length);
  };

  const handleRemoveLeadField = (id: string) => {
    if (leads.length > 1) {
      const indexToRemove = leads.findIndex(l => l.id === id);
      setLeads(leads.filter(l => l.id !== id));
      setActiveLeadIndex(prev => {
        if (prev >= leads.length - 1) {
          return Math.max(0, leads.length - 2);
        }
        if (prev > indexToRemove) {
          return prev - 1;
        }
        return prev;
      });
    }
  };

  const handleUpdateLeadField = (id: string, field: keyof FormLead, value: any) => {
    setLeads(leads.map(l => {
      if (l.id === id) {
        return {
          ...l,
          [field]: value,
          whyNotSold: field === 'sold' && value !== 'Não' ? '' : l.whyNotSold
        };
      }
      return l;
    }));
  };

  // Atualização de dados
  const [topGoogleCampaign, setTopGoogleCampaign] = useState('');
  const [topPositiveKeywords, setTopPositiveKeywords] = useState('');
  const [negativeKeywordsToUpdate, setNegativeKeywordsToUpdate] = useState('');
  const [salesTeamObservations, setSalesTeamObservations] = useState('');
  
  // Feedback states
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Set Document Title
    document.title = "Portal.Achei - Formulário Semanal";

    // Fallback interval to prevent Next.js layout metadata from rewriting tab title on dev reload
    const interval = setInterval(() => {
      if (document.title !== "Portal.Achei - Formulário Semanal") {
        document.title = "Portal.Achei - Formulário Semanal";
      }
    }, 100);

    // Load clients
    setClients(mockDb.getClients());
    
    // Set default month
    const currentDate = new Date();
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    setMonth(`${months[currentDate.getMonth()]} de ${currentDate.getFullYear()}`);
    
    // Set default contact date as today for the first lead
    setLeads([
      {
        id: 'l_init_' + Math.random().toString(36).substring(2, 9),
        contactDate: currentDate.toISOString().split('T')[0],
        name: '',
        phone: '',
        campaign: '',
        sold: 'Em Andamento',
        whyNotSold: ''
      }
    ]);

    return () => clearInterval(interval);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredClients = clients.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleClear = () => {
    setSelectedClient(null);
    setSearchQuery('');
    setLeads([
      {
        id: 'l_clear_' + Math.random().toString(36).substring(2, 9),
        contactDate: new Date().toISOString().split('T')[0],
        name: '',
        phone: '',
        campaign: '',
        sold: 'Em Andamento',
        whyNotSold: ''
      }
    ]);
    setActiveLeadIndex(0);
    setTopGoogleCampaign('');
    setTopPositiveKeywords('');
    setNegativeKeywordsToUpdate('');
    setSalesTeamObservations('');
    setError(null);
    setSuccess(false);
  };

  const handleAutoFill = () => {
    if (clients.length > 0) {
      setSelectedClient(clients[0]);
    }
    const currentDate = new Date();
    setActiveLeadIndex(0);
    setLeads([
      {
        id: 'l_auto_1',
        contactDate: currentDate.toISOString().split('T')[0],
        name: 'Gustavo Nogueira',
        phone: '(11) 98765-4321',
        campaign: 'Campanha - Conversão WhatsApp Google Ads',
        sold: 'Não',
        whyNotSold: 'Lead achou o preço de onboarding muito alto'
      },
      {
        id: 'l_auto_2',
        contactDate: currentDate.toISOString().split('T')[0],
        name: 'Ana Júlia Costa',
        phone: '(11) 99988-7766',
        campaign: 'Pesquisa - Institucional Dálete Achei',
        sold: 'Sim',
        whyNotSold: ''
      }
    ]);
    setTopGoogleCampaign('Pesquisa - Institucional Dálete Achei');
    setTopPositiveKeywords('melhor agencia de marketing local, gestora de redes sociais achei');
    setNegativeKeywordsToUpdate('gratis, emprego, estagio, gratuito');
    setSalesTeamObservations('Lead demonstrou grande interesse. Sugiro fazer follow-up com desconto de 15% na taxa de setup no dia 10.');
    setError(null);
    setSuccess(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!selectedClient) {
      setError('Por favor, selecione um cliente.');
      return;
    }

    // Validate all leads
    for (let i = 0; i < leads.length; i++) {
      const l = leads[i];
      if (!l.contactDate || !l.name || !l.phone || !l.campaign) {
        setError(`Por favor, preencha todos os campos obrigatórios no Lead #${i + 1}.`);
        return;
      }
      if (l.sold === 'Não' && !l.whyNotSold) {
        setError(`Por favor, forneça o motivo de não ter vendido para o Lead #${i + 1}.`);
        return;
      }
    }

    if (!topGoogleCampaign || !topPositiveKeywords || !negativeKeywordsToUpdate) {
      setError('Por favor, preencha todos os campos obrigatórios da seção "Atualização de Dados".');
      return;
    }

    const firstLead = leads[0];
    const newSubmission: FormSubmission = {
      id: 'sub_' + Math.random().toString(36).substring(2, 9),
      clientId: selectedClient.id,
      clientName: selectedClient.name,
      month: month,
      submittedAt: new Date().toISOString(),
      status: 'pending',
      
      // Backward compatible fields (from first lead)
      leadContactDate: firstLead.contactDate,
      leadName: firstLead.name,
      leadPhone: firstLead.phone,
      leadCampaign: firstLead.campaign,
      leadSold: firstLead.sold,
      leadWhyNotSold: firstLead.whyNotSold,

      // Multiple leads list
      leads: leads.map(l => ({
        contactDate: l.contactDate,
        name: l.name,
        phone: l.phone,
        campaign: l.campaign,
        sold: l.sold,
        whyNotSold: l.whyNotSold
      })),

      topGoogleCampaign,
      topPositiveKeywords,
      negativeKeywordsToUpdate,
      salesTeamObservations
    };

    const existing = mockDb.getSubmissions();
    mockDb.saveSubmissions([...existing, newSubmission]);

    setSuccess(true);
    
    // Clear dynamic fields while maintaining client selection
    setLeads([
      {
        id: 'l_reset_' + Math.random().toString(36).substring(2, 9),
        contactDate: new Date().toISOString().split('T')[0],
        name: '',
        phone: '',
        campaign: '',
        sold: 'Em Andamento',
        whyNotSold: ''
      }
    ]);
    setActiveLeadIndex(0);
    setTopGoogleCampaign('');
    setTopPositiveKeywords('');
    setNegativeKeywordsToUpdate('');
    setSalesTeamObservations('');
    setSearchQuery('');
  };

  return (
    <div className="flex-1 flex flex-col justify-center items-center px-4 py-12 bg-gradient-to-br from-[#121214] via-[#1c1c20] to-[#121214] relative overflow-hidden">
      
      {/* Background design elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-zinc-800/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-zinc-800/10 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-2xl z-10 space-y-8">
        
        {/* Logo / Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 p-3 bg-zinc-800/50 border border-zinc-700/50 rounded-2xl mb-3 shadow-inner">
            <Calendar className="w-6 h-6 text-zinc-300" />
            <span className="text-2xl font-black tracking-tight text-white">
              Portal<span className="text-zinc-400">.Achei</span>
            </span>
          </div>
          <h1 className="text-xl font-bold text-white mt-2">Envio de Relatório Comercial & Tráfego</h1>
          <p className="text-sm text-zinc-400 mt-1">Preencha os dados abaixo para enviar à fila de aprovação e relatórios da agência.</p>
        </div>

        {/* Form Card */}
        <Card className="border border-zinc-800 bg-zinc-900/60 backdrop-blur-md shadow-2xl">
          <CardHeader>
            <CardTitle className="text-lg text-white">Novo Formulário</CardTitle>
            <CardDescription className="text-zinc-400">
              Todos os campos marcados com * são obrigatórios para a implantação das respostas.
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              
              {/* Feedback messages */}
              {error && (
                <div className="p-3 bg-red-950/40 border border-red-900/50 rounded-lg text-red-200 text-xs">
                  {error}
                </div>
              )}

              {success && (
                <div className="flex items-center gap-2.5 p-4 bg-emerald-950/40 border border-emerald-900/50 rounded-xl text-emerald-200 text-xs">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <p className="font-semibold">Relatório enviado com sucesso!</p>
                    <p className="text-emerald-400/80 mt-0.5">Foi encaminhado para validação e aprovação do time.</p>
                  </div>
                </div>
              )}

              {/* General details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-zinc-800/60">
                {/* Client Select2 */}
                <div className="space-y-2" ref={dropdownRef}>
                  <Label className="text-zinc-300">Cliente (Empresa/Contrato) <span className="text-red-500">*</span></Label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsOpen(!isOpen)}
                      className="w-full flex items-center justify-between px-3 py-2 bg-zinc-950/50 border border-zinc-800 rounded-lg text-sm text-white focus:outline-none focus:border-zinc-700 transition text-left"
                    >
                      <span className={selectedClient ? "text-white font-medium" : "text-zinc-500"}>
                        {selectedClient ? selectedClient.name : 'Selecione o cliente...'}
                      </span>
                      <ChevronDown className="w-4 h-4 text-zinc-500" />
                    </button>

                    {/* Dropdown Options */}
                    {isOpen && (
                      <div className="absolute z-20 w-full mt-1.5 bg-zinc-950 border border-zinc-800 rounded-lg shadow-xl overflow-hidden max-h-60 flex flex-col">
                        <div className="flex items-center gap-2 px-3 py-2 border-b border-zinc-800 bg-zinc-900/40">
                          <Search className="w-4 h-4 text-zinc-500 shrink-0" />
                          <input
                            type="text"
                            placeholder="Buscar cliente..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-transparent border-0 outline-none text-xs text-white placeholder-zinc-500 w-full"
                            autoFocus
                          />
                        </div>
                        <div className="overflow-y-auto flex-1">
                          {filteredClients.length > 0 ? (
                            filteredClients.map((client) => (
                              <button
                                key={client.id}
                                type="button"
                                onClick={() => {
                                  setSelectedClient(client);
                                  setIsOpen(false);
                                  setSearchQuery('');
                                }}
                                className="w-full text-left px-3 py-2 text-xs transition-colors hover:bg-zinc-900 flex flex-col"
                              >
                                <span className="font-semibold text-white">{client.name}</span>
                                <span className="text-[10px] text-zinc-500 mt-0.5">{client.serviceType}</span>
                              </button>
                            ))
                          ) : (
                            <div className="p-3 text-center text-xs text-zinc-500">Nenhum cliente encontrado</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Month field */}
                <div className="space-y-2">
                  <Label htmlFor="month" className="text-zinc-300">Mês de Referência <span className="text-red-500">*</span></Label>
                  <Input
                    id="month"
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    placeholder="Ex: Junho de 2026"
                    className="bg-zinc-950/50 border-zinc-800 text-white"
                  />
                </div>
              </div>

              {/* SECTION 1: VALIDAÇÃO DOS LEADS */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-800/40">
                  <div className="flex items-center gap-2">
                    <ClipboardCheck className="w-5 h-5 text-yellow-500" />
                    <h3 className="text-sm font-semibold text-white">1. Validação dos Leads</h3>
                    {leads.length > 1 && (
                      <div className="flex items-center gap-1.5 ml-3 bg-zinc-900/80 border border-zinc-800/80 px-1 py-1 rounded-lg shadow-inner">
                        <button
                          type="button"
                          onClick={() => setActiveLeadIndex(prev => Math.max(0, prev - 1))}
                          disabled={activeLeadIndex === 0}
                          className="p-1 rounded-md text-zinc-400 hover:text-yellow-400 hover:bg-zinc-800 disabled:opacity-20 disabled:hover:text-zinc-400 disabled:hover:bg-transparent transition-all cursor-pointer"
                          title="Lead Anterior"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="text-[10px] font-bold text-zinc-300 min-w-[38px] text-center select-none tracking-wider bg-zinc-950/60 py-0.5 px-1.5 rounded border border-zinc-800/40">
                          {activeLeadIndex + 1} / {leads.length}
                        </span>
                        <button
                          type="button"
                          onClick={() => setActiveLeadIndex(prev => Math.min(leads.length - 1, prev + 1))}
                          disabled={activeLeadIndex === leads.length - 1}
                          className="p-1 rounded-md text-zinc-400 hover:text-yellow-400 hover:bg-zinc-800 disabled:opacity-20 disabled:hover:text-zinc-400 disabled:hover:bg-transparent transition-all cursor-pointer"
                          title="Próximo Lead"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddLeadField}
                    className="border-zinc-800 hover:bg-zinc-800 text-zinc-300 text-[10px] flex items-center gap-1 h-7 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Adicionar Lead
                  </Button>
                </div>

                <div className="space-y-4">
                  {leads.map((lead, index) => {
                    if (index !== activeLeadIndex) return null;
                    return (
                      <div key={lead.id} className="p-4 bg-zinc-950/30 border border-zinc-800/50 rounded-xl space-y-4 relative animate-fadeIn">
                      <div className="flex justify-between items-center pb-2 border-b border-zinc-850/60">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Lead #{index + 1}</span>
                        {leads.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveLeadField(lead.id)}
                            className="text-zinc-500 hover:text-red-400 transition cursor-pointer"
                            title="Remover este lead"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-zinc-450">Data do contato <span className="text-red-500">*</span></Label>
                          <Input
                            type="date"
                            value={lead.contactDate}
                            onChange={(e) => handleUpdateLeadField(lead.id, 'contactDate', e.target.value)}
                            className="bg-zinc-950/50 border-zinc-800 text-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-zinc-450">Nome do Lead <span className="text-red-500">*</span></Label>
                          <Input
                            value={lead.name}
                            onChange={(e) => handleUpdateLeadField(lead.id, 'name', e.target.value)}
                            placeholder="Nome completo do lead"
                            className="bg-zinc-950/50 border-zinc-800 text-white"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-zinc-450">Telefone para contato <span className="text-red-500">*</span></Label>
                          <Input
                            value={lead.phone}
                            onChange={(e) => handleUpdateLeadField(lead.id, 'phone', e.target.value)}
                            placeholder="Ex: (11) 98888-7777"
                            className="bg-zinc-950/50 border-zinc-800 text-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-zinc-450">Campanha originária <span className="text-red-500">*</span></Label>
                          <Input
                            value={lead.campaign}
                            onChange={(e) => handleUpdateLeadField(lead.id, 'campaign', e.target.value)}
                            placeholder="Ex: Black Friday - Meta Ads"
                            className="bg-zinc-950/50 border-zinc-800 text-white"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                          <Label className="text-zinc-450">Vendeu? <span className="text-red-500">*</span></Label>
                          <div className="flex gap-4">
                            {['Sim', 'Não', 'Em Andamento'].map((opt) => (
                              <label key={opt} className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                                <input
                                  type="radio"
                                  name={`leadSold-${lead.id}`}
                                  value={opt}
                                  checked={lead.sold === opt}
                                  onChange={() => handleUpdateLeadField(lead.id, 'sold', opt as any)}
                                  className="accent-zinc-300"
                                />
                                {opt}
                              </label>
                            ))}
                          </div>
                        </div>

                        {lead.sold === 'Não' && (
                          <div className="space-y-2 animate-fadeIn">
                            <Label className="text-zinc-450">Por que não vendeu? <span className="text-red-500">*</span></Label>
                            <Input
                              value={lead.whyNotSold}
                              onChange={(e) => handleUpdateLeadField(lead.id, 'whyNotSold', e.target.value)}
                              placeholder="Ex: Achou o preço alto, fora do perfil de cliente ideal..."
                              className="bg-zinc-950/50 border-zinc-800 text-white"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                </div>
              </div>

              {/* SECTION 2: ATUALIZAÇÃO DE DADOS */}
              <div className="space-y-4 pt-4 border-t border-zinc-800/40">
                <div className="flex items-center gap-2 pb-2 border-b border-zinc-800/40">
                  <Database className="w-5 h-5 text-blue-400" />
                  <h3 className="text-sm font-semibold text-white">2. Atualização de Dados (Tráfego & Comercial)</h3>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="topGoogleCampaign" className="text-zinc-450">Campanha que mais performou (Google Ads) <span className="text-red-500">*</span></Label>
                    <Input
                      id="topGoogleCampaign"
                      value={topGoogleCampaign}
                      onChange={(e) => setTopGoogleCampaign(e.target.value)}
                      placeholder="Ex: Campanha de Pesquisa Institucional"
                      className="bg-zinc-950/50 border-zinc-800 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="topPositiveKeywords" className="text-zinc-300">Palavras-Chaves Positivas que mais foram pesquisadas <span className="text-red-500">*</span></Label>
                    <span className="block text-[10px] text-zinc-500 mt-0.5">(Pesquisadas no Google e que o cliente recebeu de verdade)</span>
                    <Input
                      id="topPositiveKeywords"
                      value={topPositiveKeywords}
                      onChange={(e) => setTopPositiveKeywords(e.target.value)}
                      placeholder="Ex: agencia de marketing digital, gestao de trafego achei"
                      className="bg-zinc-950/50 border-zinc-800 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="negativeKeywordsToUpdate" className="text-zinc-300">Palavras-Chave Negativas que precisamos atualizar segundo o cliente <span className="text-red-500">*</span></Label>
                    <Input
                      id="negativeKeywordsToUpdate"
                      value={negativeKeywordsToUpdate}
                      onChange={(e) => setNegativeKeywordsToUpdate(e.target.value)}
                      placeholder="Ex: gratuito, curso gratis, emprego"
                      className="bg-zinc-950/50 border-zinc-800 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="salesObservations" className="text-zinc-300">Observações Gerais do time Comercial</Label>
                    <textarea
                      id="salesObservations"
                      rows={3}
                      value={salesTeamObservations}
                      onChange={(e) => setSalesTeamObservations(e.target.value)}
                      placeholder="Alguma informação adicional importante sobre a qualidade das leads ou feedbacks do cliente..."
                      className="w-full text-sm rounded-lg px-3 py-2 bg-zinc-950/50 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-700 transition"
                    />
                  </div>
                </div>
              </div>

            </CardContent>

            <CardFooter className="flex justify-between items-center border-t border-zinc-800/40 pt-4 mt-2">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClear}
                  className="border-zinc-800 hover:bg-zinc-800 text-zinc-300 text-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5 text-zinc-500" /> Apagar Tudo
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAutoFill}
                  className="border-zinc-800 hover:bg-zinc-800 text-zinc-300 text-xs cursor-pointer flex items-center gap-1.5"
                >
                  Auto-preencher
                </Button>
              </div>
              <Button
                type="submit"
                className="bg-zinc-100 hover:bg-zinc-200 text-zinc-950 text-xs font-semibold cursor-pointer flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" /> Enviar Relatório
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
