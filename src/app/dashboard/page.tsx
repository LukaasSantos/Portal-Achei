'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/authContext';
import { useRouter } from 'next/navigation';
import { mockDb, Client, Lead, Transaction } from '@/lib/mockDb';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
  LayoutDashboard, 
  Users, 
  DollarSign, 
  TrendingUp, 
  FolderKanban, 
  LogOut, 
  User as UserIcon, 
  Plus, 
  Search, 
  Filter, 
  Briefcase, 
  Phone, 
  Mail, 
  TrendingDown, 
  Calendar, 
  CheckCircle, 
  AlertTriangle,
  ArrowRight,
  Settings,
  Megaphone,
  Download
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function DashboardPage() {
  const { user, logout, loading: authLoading } = useAuth();
  const router = useRouter();
  
  // Navigation State
  const [activeTab, setActiveTab] = useState<'overview' | 'clients' | 'comercial' | 'financeiro' | 'relatorios' | 'configuracoes' | 'ads'>('overview');
  
  // Data States
  const [clients, setClients] = useState<Client[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  // Dialog Open States
  const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);
  const [isLeadDialogOpen, setIsLeadDialogOpen] = useState(false);
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false);

  // Form Fields
  // Client Form
  const [newClient, setNewClient] = useState({ name: '', email: '', phone: '', contractValue: '', status: 'Ativo' as any, serviceType: '' });
  // Lead Form
  const [newLead, setNewLead] = useState({ name: '', company: '', email: '', value: '', status: 'new' as any, notes: '' });
  // Transaction Form
  const [newTransaction, setNewTransaction] = useState({ description: '', amount: '', type: 'receita' as any, category: '' });

  // Filters / Search
  const [clientSearch, setClientSearch] = useState('');
  const [clientFilterStatus, setClientFilterStatus] = useState('Todos');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    // Load initial mock data
    setClients(mockDb.getClients());
    setLeads(mockDb.getLeads());
    setTransactions(mockDb.getTransactions());
  }, []);

  if (authLoading || !user) {
    return (
      <div className="flex-grow flex items-center justify-center bg-[#121214]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-t-zinc-400 border-zinc-800 rounded-full animate-spin"></div>
          <p className="text-zinc-400 text-sm">Carregando painel...</p>
        </div>
      </div>
    );
  }

  // --- Handlers ---
  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClient.name || !newClient.email || !newClient.contractValue || !newClient.serviceType) return;
    
    const clientToAdd: Client = {
      id: 'c_' + Math.random().toString(36).substring(2, 9),
      name: newClient.name,
      email: newClient.email,
      phone: newClient.phone || '(00) 00000-0000',
      contractValue: Number(newClient.contractValue),
      status: newClient.status,
      serviceType: newClient.serviceType,
      startDate: new Date().toISOString().split('T')[0]
    };
    
    const updated = [...clients, clientToAdd];
    setClients(updated);
    mockDb.saveClients(updated);
    setIsClientDialogOpen(false);
    setNewClient({ name: '', email: '', phone: '', contractValue: '', status: 'Ativo', serviceType: '' });
  };

  const handleAddLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLead.name || !newLead.company || !newLead.value) return;

    const leadToAdd: Lead = {
      id: 'l_' + Math.random().toString(36).substring(2, 9),
      name: newLead.name,
      company: newLead.company,
      email: newLead.email || 'contato@' + newLead.company.toLowerCase().replace(/\s/g, '') + '.com',
      value: Number(newLead.value),
      status: newLead.status,
      notes: newLead.notes,
      updatedAt: new Date().toISOString().split('T')[0]
    };

    const updated = [...leads, leadToAdd];
    setLeads(updated);
    mockDb.saveLeads(updated);
    setIsLeadDialogOpen(false);
    setNewLead({ name: '', company: '', email: '', value: '', status: 'new', notes: '' });
  };

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTransaction.description || !newTransaction.amount || !newTransaction.category) return;

    const txToAdd: Transaction = {
      id: 't_' + Math.random().toString(36).substring(2, 9),
      description: newTransaction.description,
      amount: Number(newTransaction.amount),
      type: newTransaction.type,
      category: newTransaction.category,
      date: new Date().toISOString().split('T')[0]
    };

    const updated = [...transactions, txToAdd];
    setTransactions(updated);
    mockDb.saveTransactions(updated);
    setIsTransactionDialogOpen(false);
    setNewTransaction({ description: '', amount: '', type: 'receita', category: '' });
  };

  const handleUpdateLeadStatus = (leadId: string, newStatus: Lead['status']) => {
    const updated = leads.map(l => l.id === leadId ? { ...l, status: newStatus, updatedAt: new Date().toISOString().split('T')[0] } : l);
    setLeads(updated);
    mockDb.saveLeads(updated);
  };

  const handleExportAdsCSV = (specificClient?: Client) => {
    const list = specificClient ? [specificClient] : clients.filter(c => c.status === 'Ativo');
    
    let csvContent = '\uFEFF'; // UTF-8 BOM
    csvContent += 'Cliente;Serviço;Impressões;Cliques;CPC Médio;Conversões;CPA;Investimento Semanal\n';
    
    list.forEach((client) => {
      const seed = client.name.length;
      const impressions = seed * 45000 + 10000;
      const clicks = Math.round(impressions * (seed * 0.008 + 0.02));
      const investment = Math.round(client.contractValue * 0.6);
      const cpc = Number((investment / clicks).toFixed(2));
      const conversions = Math.round(clicks * 0.12);
      const cpa = Number((investment / conversions).toFixed(2));
      
      csvContent += `"${client.name}";"${client.serviceType}";${impressions};${clicks};${cpc};${conversions};${cpa};${investment}\n`;
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    const filename = specificClient 
      ? `relatorio-ads-${specificClient.name.toLowerCase().replace(/\s/g, '-')}-${new Date().toISOString().split('T')[0]}.csv`
      : `relatorio-google-ads-geral-${new Date().toISOString().split('T')[0]}.csv`;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportAdsPDF = (specificClient?: Client) => {
    const list = specificClient ? [specificClient] : clients.filter(c => c.status === 'Ativo');
    const title = specificClient ? `Relatório Google Ads - ${specificClient.name}` : 'Relatório Google Ads Consolidado - Portal.Achei';
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    let rowsHtml = '';
    list.forEach(client => {
      const seed = client.name.length;
      const impressions = seed * 45000 + 10000;
      const clicks = Math.round(impressions * (seed * 0.008 + 0.02));
      const investment = Math.round(client.contractValue * 0.6);
      const cpc = Number((investment / clicks).toFixed(2));
      const conversions = Math.round(clicks * 0.12);
      const cpa = Number((investment / conversions).toFixed(2));
      
      rowsHtml += `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #1e293b;">${client.name}</td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; color: #475569;">${client.serviceType}</td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right; color: #475569;">${impressions.toLocaleString('pt-BR')}</td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right; color: #475569;">${clicks.toLocaleString('pt-BR')}</td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right; color: #475569;">R$ ${cpc.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right; color: #475569;">${conversions.toLocaleString('pt-BR')}</td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: bold; color: #10b981;">R$ ${cpa.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: bold; color: #1e293b;">R$ ${investment.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
        </tr>
      `;
    });

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: 'Inter', system-ui, sans-serif; padding: 40px; background-color: #ffffff; color: #1e293b; margin: 0; }
          .header { border-bottom: 3px solid #0f172a; padding-bottom: 20px; margin-bottom: 30px; }
          .title { font-size: 24px; font-weight: 800; color: #0f172a; margin: 0; }
          .subtitle { font-size: 14px; color: #64748b; margin-top: 5px; }
          .meta { font-size: 12px; color: #94a3b8; text-align: right; float: right; margin-top: -45px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 13px; }
          th { background-color: #f1f5f9; padding: 12px 10px; text-align: left; font-weight: 700; color: #0f172a; border-bottom: 2px solid #cbd5e1; }
          .footer { margin-top: 50px; border-top: 1px solid #e2e8f0; padding-top: 20px; font-size: 11px; color: #64748b; text-align: center; }
          @media print {
            body { padding: 20px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 class="title">${title}</h1>
          <p class="subtitle">Relatório gerado internamente pelo Portal.Achei</p>
          <div class="meta">
            Data: ${new Date().toLocaleDateString('pt-BR')}<br>
            Responsável: ${user.name}
          </div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Serviço</th>
              <th style="text-align: right;">Impressões</th>
              <th style="text-align: right;">Cliques</th>
              <th style="text-align: right;">CPC</th>
              <th style="text-align: right;">Conversões</th>
              <th style="text-align: right;">CPA</th>
              <th style="text-align: right;">Investimento Semanal</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
        
        <div class="footer">
          Portal.Achei - Inteligência e Gestão de Marketing &copy; ${new Date().getFullYear()}
        </div>
        
        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() { window.close(); }, 500);
          }
        </script>
      </body>
      </html>
    `;
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  // --- Calculations ---
  const totalFaturamento = clients
    .filter(c => c.status === 'Ativo')
    .reduce((acc, c) => acc + c.contractValue, 0);

  const totalReceitas = transactions
    .filter(t => t.type === 'receita')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalDespesas = transactions
    .filter(t => t.type === 'despesa')
    .reduce((acc, t) => acc + t.amount, 0);

  const saldoLiquido = totalReceitas - totalDespesas;

  // Chart Data preparation (group transactions or simple mock date array for flow)
  const chartData = [
    { name: 'Jan', receita: 38000, despesa: 19000 },
    { name: 'Fev', receita: 42000, despesa: 20000 },
    { name: 'Mar', receita: 46000, despesa: 24000 },
    { name: 'Abr', receita: 49000, despesa: 22000 },
    { name: 'Mai', receita: 54000, despesa: 26000 },
    { name: 'Jun', receita: totalReceitas > 0 ? totalReceitas : 52000, despesa: totalDespesas > 0 ? totalDespesas : 23000 },
  ];

  return (
    <div className="flex-1 flex min-h-screen bg-[#121214]">
      {/* Sidebar */}
      <aside className="w-64 bg-[#18181b] border-r border-zinc-800 flex flex-col justify-between p-4 shrink-0">
        <div className="space-y-6">
          {/* Brand */}
          <div className="flex items-center gap-2 px-3 py-2">
            <Calendar className="w-5 h-5 text-zinc-300" />
            <span className="text-xl font-black text-white tracking-tight">
              Portal<span className="text-zinc-400">.Achei</span>
            </span>
          </div>

          {/* User Info */}
          <div className="px-3 py-2 bg-zinc-900/50 border border-zinc-800 rounded-xl flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-zinc-700 flex items-center justify-center text-sm font-semibold text-white">
              {user.name.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-white truncate">{user.name}</p>
              <p className="text-[10px] text-zinc-500 truncate">{user.role}</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                activeTab === 'overview' 
                  ? 'bg-zinc-800 text-white font-semibold' 
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Geral / Visão Geral
            </button>
            <button
              onClick={() => setActiveTab('clients')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                activeTab === 'clients' 
                  ? 'bg-zinc-800 text-white font-semibold' 
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              Clientes
            </button>
            <button
              onClick={() => setActiveTab('ads')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                activeTab === 'ads' 
                  ? 'bg-zinc-800 text-white font-semibold' 
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
              }`}
            >
              <Megaphone className="w-4 h-4" />
              Gestão Ads
            </button>
            <button
              onClick={() => setActiveTab('comercial')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                activeTab === 'comercial' 
                  ? 'bg-zinc-800 text-white font-semibold' 
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
              }`}
            >
              <FolderKanban className="w-4 h-4" />
              Comercial (CRM)
            </button>
            <button
              onClick={() => setActiveTab('financeiro')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                activeTab === 'financeiro' 
                  ? 'bg-zinc-800 text-white font-semibold' 
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              Financeiro
            </button>
            <button
              onClick={() => setActiveTab('relatorios')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                activeTab === 'relatorios' 
                  ? 'bg-zinc-800 text-white font-semibold' 
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              Relatórios
            </button>
          </nav>
        </div>
      </aside>

      {/* Content wrapper */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        
        {/* Topbar */}
        <header className="h-16 border-b border-zinc-800 bg-[#18181b]/45 backdrop-blur-md px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-zinc-300">Olá, <span className="font-semibold text-white">{user.name}</span> 👋</span>
          </div>

          <div className="flex items-center gap-4">
            {/* User Field / Role info */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-zinc-900/50 border border-zinc-805 rounded-lg text-xs">
              <UserIcon className="w-3.5 h-3.5 text-zinc-500" />
              <span className="font-semibold text-zinc-300">{user.email}</span>
              <span className="text-[10px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded font-mono uppercase">{user.role}</span>
            </div>

            {/* Settings button which switches tab */}
            <button
              onClick={() => setActiveTab('configuracoes')}
              title="Configurações do Portal"
              className={`p-2 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-lg transition cursor-pointer border border-transparent hover:border-zinc-700/50 ${
                activeTab === 'configuracoes' ? 'bg-zinc-850 text-white border-zinc-700/50' : ''
              }`}
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Logout Button */}
            <button
              onClick={logout}
              title="Sair do sistema"
              className="p-2 hover:bg-red-950/20 text-zinc-400 hover:text-red-400 rounded-lg transition cursor-pointer border border-transparent hover:border-red-900/30"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto p-8 max-w-7xl w-full mx-auto">
        
        {/* --- 1. OVERVIEW / VISION GERAL --- */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-white">Dashboard Principal</h2>
                <p className="text-sm text-zinc-400">Resumo consolidado das operações da agência.</p>
              </div>
            </div>

            {/* Quick Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-[#1e1e24] border-zinc-800/80">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Receita Mensal Recorrente</CardTitle>
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold text-white">
                    {totalFaturamento.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </div>
                  <p className="text-[10px] text-emerald-400 mt-1 flex items-center gap-0.5">
                    <TrendingUp className="w-3 h-3" /> +12% em relação ao mês anterior
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-[#1e1e24] border-zinc-800/80">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Clientes Ativos</CardTitle>
                  <Users className="w-4 h-4 text-zinc-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold text-white">
                    {clients.filter(c => c.status === 'Ativo').length} <span className="text-xs text-zinc-500 font-normal">/ {clients.length}</span>
                  </div>
                  <p className="text-[10px] text-zinc-400 mt-1">Taxa de cancelamento menor que 2%</p>
                </CardContent>
              </Card>

              <Card className="bg-[#1e1e24] border-zinc-800/80">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Leads Ativos</CardTitle>
                  <FolderKanban className="w-4 h-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold text-white">
                    {leads.filter(l => l.status !== 'won' && l.status !== 'lost').length}
                  </div>
                  <p className="text-[10px] text-yellow-400 mt-1 flex items-center gap-0.5">
                    {leads.filter(l => l.status === 'proposal').length} propostas enviadas
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-[#1e1e24] border-zinc-800/80">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Saldo Financeiro</CardTitle>
                  <TrendingUp className={`w-4 h-4 ${saldoLiquido >= 0 ? 'text-emerald-400' : 'text-red-400'}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold text-white">
                    {saldoLiquido.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </div>
                  <p className="text-[10px] text-zinc-400 mt-1">Fluxo de Caixa Operacional</p>
                </CardContent>
              </Card>
            </div>

            {/* Graphics & Overview Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Financial flow Graph */}
              <Card className="lg:col-span-2 bg-[#1e1e24] border-zinc-800/80">
                <CardHeader>
                  <CardTitle className="text-sm font-semibold text-white">Desempenho Financeiro Recente</CardTitle>
                  <CardDescription className="text-zinc-500">Comparativo mensal entre receitas e despesas.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorDespesa" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                        <XAxis dataKey="name" stroke="#71717a" fontSize={11} />
                        <YAxis stroke="#71717a" fontSize={11} />
                        <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px' }} />
                        <Area type="monotone" dataKey="receita" stroke="#10b981" fillOpacity={1} fill="url(#colorReceita)" name="Receitas" />
                        <Area type="monotone" dataKey="despesa" stroke="#ef4444" fillOpacity={1} fill="url(#colorDespesa)" name="Despesas" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* CRM / Quick Leads Overview */}
              <Card className="bg-[#1e1e24] border-zinc-800/80">
                <CardHeader>
                  <CardTitle className="text-sm font-semibold text-white">Últimos Leads Registrados</CardTitle>
                  <CardDescription className="text-zinc-500">Funil comercial da agência.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {leads.slice(0, 4).map((l) => (
                    <div key={l.id} className="flex justify-between items-center p-2.5 bg-zinc-900/40 border border-zinc-800/60 rounded-xl">
                      <div>
                        <p className="text-xs font-semibold text-white">{l.name}</p>
                        <p className="text-[10px] text-zinc-500">{l.company}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-white">
                          {l.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </p>
                        <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-semibold mt-1 uppercase ${
                          l.status === 'won' ? 'bg-emerald-950 text-emerald-400' :
                          l.status === 'lost' ? 'bg-red-950 text-red-400' :
                          l.status === 'proposal' ? 'bg-blue-950 text-blue-400' : 'bg-zinc-800 text-zinc-300'
                        }`}>
                          {l.status === 'new' ? 'Novo' : 
                           l.status === 'contact' ? 'Contato' : 
                           l.status === 'proposal' ? 'Proposta' : 
                           l.status === 'won' ? 'Ganho' : 'Perdido'}
                        </span>
                      </div>
                    </div>
                  ))}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full text-xs text-zinc-300 border-zinc-850 hover:bg-zinc-800"
                    onClick={() => setActiveTab('comercial')}
                  >
                    Ver pipeline completo
                  </Button>
                </CardContent>
              </Card>

            </div>
          </div>
        )}

        {/* --- 2. CLIENTS MODULE --- */}
        {activeTab === 'clients' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-white">Módulo de Clientes</h2>
                <p className="text-sm text-zinc-400">Gerenciamento da carteira de clientes ativos e contratos da agência.</p>
              </div>

              {/* Add Client Dialog */}
              <Dialog open={isClientDialogOpen} onOpenChange={setIsClientDialogOpen}>
                <DialogTrigger className="inline-flex items-center justify-center rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-950 text-xs font-semibold gap-1.5 px-3 py-2 cursor-pointer transition-colors">
                  <Plus className="w-4 h-4" /> Novo Cliente
                </DialogTrigger>
                <DialogContent className="bg-zinc-900 border border-zinc-800 text-white">
                  <DialogHeader>
                    <DialogTitle>Adicionar Novo Cliente</DialogTitle>
                    <DialogDescription className="text-zinc-400">Preencha os dados do cliente abaixo para adicioná-lo ao portfólio.</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddClient} className="space-y-4 py-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="c-name" className="text-zinc-300">Nome do Cliente/Empresa</Label>
                        <Input 
                          id="c-name" 
                          placeholder="Ex: Coca Cola"
                          value={newClient.name} 
                          onChange={e => setNewClient({...newClient, name: e.target.value})} 
                          className="bg-zinc-950 border-zinc-800 text-white" 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="c-type" className="text-zinc-300">Serviço Prestado</Label>
                        <Input 
                          id="c-type" 
                          placeholder="Ex: Gestão de Tráfego"
                          value={newClient.serviceType} 
                          onChange={e => setNewClient({...newClient, serviceType: e.target.value})} 
                          className="bg-zinc-950 border-zinc-800 text-white" 
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="c-email" className="text-zinc-300">E-mail</Label>
                        <Input 
                          id="c-email" 
                          placeholder="Ex: contato@empresa.com"
                          value={newClient.email} 
                          onChange={e => setNewClient({...newClient, email: e.target.value})} 
                          className="bg-zinc-950 border-zinc-800 text-white" 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="c-phone" className="text-zinc-300">Telefone</Label>
                        <Input 
                          id="c-phone" 
                          placeholder="Ex: (11) 99999-9999"
                          value={newClient.phone} 
                          onChange={e => setNewClient({...newClient, phone: e.target.value})} 
                          className="bg-zinc-950 border-zinc-800 text-white" 
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="c-value" className="text-zinc-300">Valor Mensal do Contrato (R$)</Label>
                        <Input 
                          id="c-value" 
                          type="number"
                          placeholder="Ex: 5000"
                          value={newClient.contractValue} 
                          onChange={e => setNewClient({...newClient, contractValue: e.target.value})} 
                          className="bg-zinc-950 border-zinc-800 text-white" 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="c-status" className="text-zinc-300">Status Inicial</Label>
                        <Select 
                          value={newClient.status} 
                          onValueChange={val => setNewClient({...newClient, status: (val || 'Ativo') as any})}
                        >
                          <SelectTrigger className="bg-zinc-950 border-zinc-800 text-white">
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent className="bg-zinc-900 border border-zinc-800 text-white">
                            <SelectItem value="Ativo">Ativo</SelectItem>
                            <SelectItem value="Pausado">Pausado</SelectItem>
                            <SelectItem value="Cancelado">Cancelado</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <DialogFooter className="mt-6">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsClientDialogOpen(false)}
                        className="border-zinc-800 hover:bg-zinc-800 text-zinc-300"
                      >
                        Cancelar
                      </Button>
                      <Button type="submit" className="bg-zinc-100 hover:bg-zinc-200 text-zinc-950">
                        Adicionar Cliente
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3 items-center bg-zinc-900/30 p-3 rounded-xl border border-zinc-800">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                <Input
                  placeholder="Pesquisar por cliente ou serviço..."
                  className="pl-9 bg-zinc-950 border-zinc-800 text-white placeholder-zinc-500 focus:border-zinc-700"
                  value={clientSearch}
                  onChange={e => setClientSearch(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                <span className="text-xs text-zinc-400 flex items-center gap-1.5 whitespace-nowrap">
                  <Filter className="w-3.5 h-3.5" /> Filtrar Status:
                </span>
                <Select value={clientFilterStatus} onValueChange={val => setClientFilterStatus(val || 'Todos')}>
                  <SelectTrigger className="w-[140px] bg-zinc-950 border-zinc-800 text-white text-xs">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border border-zinc-800 text-white">
                    <SelectItem value="Todos">Todos</SelectItem>
                    <SelectItem value="Ativo">Ativos</SelectItem>
                    <SelectItem value="Pausado">Pausados</SelectItem>
                    <SelectItem value="Cancelado">Cancelados</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Clients Table */}
            <div className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-900/40">
              <Table>
                <TableHeader className="bg-zinc-900/50">
                  <TableRow className="border-b border-zinc-800">
                    <TableHead className="text-zinc-400 font-semibold">Cliente</TableHead>
                    <TableHead className="text-zinc-400 font-semibold">Serviço</TableHead>
                    <TableHead className="text-zinc-400 font-semibold">Valor Mensal</TableHead>
                    <TableHead className="text-zinc-400 font-semibold">Data Início</TableHead>
                    <TableHead className="text-zinc-400 font-semibold">Status</TableHead>
                    <TableHead className="text-zinc-400 font-semibold">Contatos</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clients
                    .filter(c => {
                      const matchesSearch = c.name.toLowerCase().includes(clientSearch.toLowerCase()) || 
                                            c.serviceType.toLowerCase().includes(clientSearch.toLowerCase());
                      const matchesStatus = clientFilterStatus === 'Todos' || c.status === clientFilterStatus;
                      return matchesSearch && matchesStatus;
                    })
                    .map((c) => (
                      <TableRow key={c.id} className="border-b border-zinc-800/60 hover:bg-zinc-900/20">
                        <TableCell className="font-semibold text-white">{c.name}</TableCell>
                        <TableCell className="text-zinc-300">{c.serviceType}</TableCell>
                        <TableCell className="font-medium text-white">
                          {c.contractValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </TableCell>
                        <TableCell className="text-zinc-400 text-xs">
                          {new Date(c.startDate).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                            c.status === 'Ativo' ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-900/50' :
                            c.status === 'Pausado' ? 'bg-yellow-950/80 text-yellow-400 border border-yellow-900/50' : 
                            'bg-red-950/80 text-red-400 border border-red-900/50'
                          }`}>
                            {c.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs text-zinc-400 space-y-0.5">
                          <div className="flex items-center gap-1"><Mail className="w-3 h-3 text-zinc-600" /> {c.email}</div>
                          {c.phone && <div className="flex items-center gap-1"><Phone className="w-3 h-3 text-zinc-600" /> {c.phone}</div>}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* --- 3. COMMERCIAL / CRM (KANBAN BOARD) --- */}
        {activeTab === 'comercial' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-white">Funil de Vendas (CRM)</h2>
                <p className="text-sm text-zinc-400">Gerenciamento de leads e novas oportunidades de negócios da agência.</p>
              </div>

              {/* Add Lead Dialog */}
              <Dialog open={isLeadDialogOpen} onOpenChange={setIsLeadDialogOpen}>
                <DialogTrigger className="inline-flex items-center justify-center rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-950 text-xs font-semibold gap-1.5 px-3 py-2 cursor-pointer transition-colors">
                  <Plus className="w-4 h-4" /> Novo Lead
                </DialogTrigger>
                <DialogContent className="bg-zinc-900 border border-zinc-800 text-white">
                  <DialogHeader>
                    <DialogTitle>Registrar Novo Lead</DialogTitle>
                    <DialogDescription className="text-zinc-400">Adicione uma oportunidade de marketing digital ao funil de vendas.</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddLead} className="space-y-4 py-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="l-name" className="text-zinc-300">Nome do Contato</Label>
                        <Input 
                          id="l-name" 
                          placeholder="Ex: Carlos Silva"
                          value={newLead.name} 
                          onChange={e => setNewLead({...newLead, name: e.target.value})} 
                          className="bg-zinc-950 border-zinc-800 text-white" 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="l-company" className="text-zinc-300">Empresa</Label>
                        <Input 
                          id="l-company" 
                          placeholder="Ex: Clinica Sorriso"
                          value={newLead.company} 
                          onChange={e => setNewLead({...newLead, company: e.target.value})} 
                          className="bg-zinc-950 border-zinc-800 text-white" 
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="l-email" className="text-zinc-300">E-mail</Label>
                        <Input 
                          id="l-email" 
                          type="email"
                          placeholder="Ex: carlos@clinica.com"
                          value={newLead.email} 
                          onChange={e => setNewLead({...newLead, email: e.target.value})} 
                          className="bg-zinc-950 border-zinc-800 text-white" 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="l-val" className="text-zinc-300">Valor Estimado (R$)</Label>
                        <Input 
                          id="l-val" 
                          type="number"
                          placeholder="Ex: 3500"
                          value={newLead.value} 
                          onChange={e => setNewLead({...newLead, value: e.target.value})} 
                          className="bg-zinc-950 border-zinc-800 text-white" 
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="l-notes" className="text-zinc-300">Observações / Detalhes</Label>
                      <Input 
                        id="l-notes" 
                        placeholder="Ex: Quer tráfego pago focado em captação de clientes locais"
                        value={newLead.notes} 
                        onChange={e => setNewLead({...newLead, notes: e.target.value})} 
                        className="bg-zinc-950 border-zinc-800 text-white" 
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="l-status" className="text-zinc-300">Estágio Inicial</Label>
                      <Select 
                        value={newLead.status} 
                        onValueChange={val => setNewLead({...newLead, status: (val || 'new') as any})}
                      >
                        <SelectTrigger className="bg-zinc-950 border-zinc-800 text-white">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border border-zinc-800 text-white">
                          <SelectItem value="new">Novo Lead</SelectItem>
                          <SelectItem value="contact">Em Contato</SelectItem>
                          <SelectItem value="proposal">Proposta Enviada</SelectItem>
                          <SelectItem value="won">Ganho / Fechado</SelectItem>
                          <SelectItem value="lost">Perdido</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <DialogFooter className="mt-6">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsLeadDialogOpen(false)}
                        className="border-zinc-800 hover:bg-zinc-800 text-zinc-300"
                      >
                        Cancelar
                      </Button>
                      <Button type="submit" className="bg-zinc-100 hover:bg-zinc-200 text-zinc-950">
                        Salvar Lead
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Kanban Boards Columns */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              
              {/* 1. NEW */}
              <div className="bg-zinc-900/40 p-4 rounded-xl border border-zinc-800 space-y-3 min-h-[300px]">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Novo Lead</h3>
                  <span className="bg-zinc-800 text-zinc-300 text-[10px] px-1.5 py-0.5 rounded font-bold">
                    {leads.filter(l => l.status === 'new').length}
                  </span>
                </div>
                <div className="space-y-2">
                  {leads.filter(l => l.status === 'new').map((l) => (
                    <Card key={l.id} className="bg-zinc-950/80 border-zinc-850 p-3 space-y-2.5">
                      <div>
                        <h4 className="text-xs font-bold text-white">{l.name}</h4>
                        <p className="text-[10px] text-zinc-500">{l.company}</p>
                      </div>
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-bold text-zinc-300">
                          {l.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                        <button 
                          onClick={() => handleUpdateLeadStatus(l.id, 'contact')} 
                          className="flex items-center text-zinc-400 hover:text-white gap-0.5 font-semibold"
                        >
                          Avançar <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* 2. CONTACT */}
              <div className="bg-zinc-900/40 p-4 rounded-xl border border-zinc-800 space-y-3 min-h-[300px]">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Em Contato</h3>
                  <span className="bg-zinc-800 text-zinc-300 text-[10px] px-1.5 py-0.5 rounded font-bold">
                    {leads.filter(l => l.status === 'contact').length}
                  </span>
                </div>
                <div className="space-y-2">
                  {leads.filter(l => l.status === 'contact').map((l) => (
                    <Card key={l.id} className="bg-zinc-950/80 border-zinc-850 p-3 space-y-2.5">
                      <div>
                        <h4 className="text-xs font-bold text-white">{l.name}</h4>
                        <p className="text-[10px] text-zinc-500">{l.company}</p>
                      </div>
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-bold text-zinc-300">
                          {l.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                        <button 
                          onClick={() => handleUpdateLeadStatus(l.id, 'proposal')} 
                          className="flex items-center text-zinc-400 hover:text-white gap-0.5 font-semibold"
                        >
                          Proposta <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* 3. PROPOSAL */}
              <div className="bg-zinc-900/40 p-4 rounded-xl border border-zinc-800 space-y-3 min-h-[300px]">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Proposta</h3>
                  <span className="bg-zinc-800 text-zinc-300 text-[10px] px-1.5 py-0.5 rounded font-bold">
                    {leads.filter(l => l.status === 'proposal').length}
                  </span>
                </div>
                <div className="space-y-2">
                  {leads.filter(l => l.status === 'proposal').map((l) => (
                    <Card key={l.id} className="bg-zinc-950/80 border-zinc-850 p-3 space-y-2.5">
                      <div>
                        <h4 className="text-xs font-bold text-white">{l.name}</h4>
                        <p className="text-[10px] text-zinc-500">{l.company}</p>
                      </div>
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-bold text-zinc-300">
                          {l.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                        <div className="flex gap-1.5">
                          <button 
                            onClick={() => handleUpdateLeadStatus(l.id, 'lost')} 
                            className="text-red-500 hover:text-red-400 font-semibold"
                          >
                            Perder
                          </button>
                          <button 
                            onClick={() => handleUpdateLeadStatus(l.id, 'won')} 
                            className="text-emerald-500 hover:text-emerald-400 font-semibold"
                          >
                            Ganhar
                          </button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* 4. WON */}
              <div className="bg-emerald-950/10 p-4 rounded-xl border border-emerald-900/20 space-y-3 min-h-[300px]">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">Ganho</h3>
                  <span className="bg-emerald-950 text-emerald-300 text-[10px] px-1.5 py-0.5 rounded font-bold">
                    {leads.filter(l => l.status === 'won').length}
                  </span>
                </div>
                <div className="space-y-2">
                  {leads.filter(l => l.status === 'won').map((l) => (
                    <Card key={l.id} className="bg-zinc-950/80 border-emerald-950/40 p-3 space-y-2.5 border">
                      <div>
                        <h4 className="text-xs font-bold text-white">{l.name}</h4>
                        <p className="text-[10px] text-zinc-500">{l.company}</p>
                      </div>
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-bold text-emerald-400">
                          {l.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                        <span className="text-[9px] text-zinc-500 italic">Fechado</span>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* 5. LOST */}
              <div className="bg-red-950/10 p-4 rounded-xl border border-red-900/20 space-y-3 min-h-[300px]">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-red-400">Perdido</h3>
                  <span className="bg-red-950 text-red-300 text-[10px] px-1.5 py-0.5 rounded font-bold">
                    {leads.filter(l => l.status === 'lost').length}
                  </span>
                </div>
                <div className="space-y-2">
                  {leads.filter(l => l.status === 'lost').map((l) => (
                    <Card key={l.id} className="bg-zinc-950/80 border-red-950/40 p-3 space-y-2.5 border">
                      <div>
                        <h4 className="text-xs font-bold text-white">{l.name}</h4>
                        <p className="text-[10px] text-zinc-500">{l.company}</p>
                      </div>
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-bold text-red-400">
                          {l.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                        <span className="text-[9px] text-zinc-500 italic">Perdido</span>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* --- 4. FINANCIAL MODULE --- */}
        {activeTab === 'financeiro' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-white">Controle Financeiro</h2>
                <p className="text-sm text-zinc-400">Gerenciamento do caixa operacional de agência (Recomendações e Despesas).</p>
              </div>

              {/* Add Transaction Dialog */}
              <Dialog open={isTransactionDialogOpen} onOpenChange={setIsTransactionDialogOpen}>
                <DialogTrigger className="inline-flex items-center justify-center rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-950 text-xs font-semibold gap-1.5 px-3 py-2 cursor-pointer transition-colors">
                  <Plus className="w-4 h-4" /> Nova Transação
                </DialogTrigger>
                <DialogContent className="bg-zinc-900 border border-zinc-800 text-white">
                  <DialogHeader>
                    <DialogTitle>Registrar Transação Financeira</DialogTitle>
                    <DialogDescription className="text-zinc-400">Registre um lançamento de receita ou despesa no livro-caixa.</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddTransaction} className="space-y-4 py-2">
                    <div className="space-y-2">
                      <Label htmlFor="tx-desc" className="text-zinc-300">Descrição</Label>
                      <Input 
                        id="tx-desc" 
                        placeholder="Ex: Mensalidade Cliente X, Compra de Software"
                        value={newTransaction.description} 
                        onChange={e => setNewTransaction({...newTransaction, description: e.target.value})} 
                        className="bg-zinc-950 border-zinc-800 text-white" 
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="tx-type" className="text-zinc-300">Tipo</Label>
                        <Select 
                          value={newTransaction.type} 
                          onValueChange={val => setNewTransaction({...newTransaction, type: (val || 'receita') as any})}
                        >
                          <SelectTrigger className="bg-zinc-950 border-zinc-800 text-white">
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent className="bg-zinc-900 border border-zinc-800 text-white">
                            <SelectItem value="receita">Receita (Entrada)</SelectItem>
                            <SelectItem value="despesa">Despesa (Saída)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="tx-val" className="text-zinc-300">Valor (R$)</Label>
                        <Input 
                          id="tx-val" 
                          type="number"
                          placeholder="Ex: 1500"
                          value={newTransaction.amount} 
                          onChange={e => setNewTransaction({...newTransaction, amount: e.target.value})} 
                          className="bg-zinc-950 border-zinc-800 text-white" 
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tx-cat" className="text-zinc-300">Categoria</Label>
                      <Input 
                        id="tx-cat" 
                        placeholder="Ex: Infraestrutura, Salários, Tráfego Pago, Serviços"
                        value={newTransaction.category} 
                        onChange={e => setNewTransaction({...newTransaction, category: e.target.value})} 
                        className="bg-zinc-950 border-zinc-800 text-white" 
                      />
                    </div>

                    <DialogFooter className="mt-6">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsTransactionDialogOpen(false)}
                        className="border-zinc-800 hover:bg-zinc-800 text-zinc-300"
                      >
                        Cancelar
                      </Button>
                      <Button type="submit" className="bg-zinc-100 hover:bg-zinc-200 text-zinc-950">
                        Confirmar Lançamento
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Financial Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-[#1e1e24] border-zinc-800/80">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Total Receitas</CardTitle>
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">
                    {totalReceitas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#1e1e24] border-zinc-800/80">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xs font-semibold uppercase tracking-wider text-red-400">Total Despesas</CardTitle>
                  <TrendingDown className="w-4 h-4 text-red-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">
                    {totalDespesas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#1e1e24] border-zinc-800/80">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-300">Lucro Líquido</CardTitle>
                  <CheckCircle className="w-4 h-4 text-zinc-300" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">
                    {saldoLiquido.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Bookkeeping Table */}
            <div className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-900/40">
              <Table>
                <TableHeader className="bg-zinc-900/50">
                  <TableRow className="border-b border-zinc-800">
                    <TableHead className="text-zinc-400 font-semibold">Descrição</TableHead>
                    <TableHead className="text-zinc-400 font-semibold">Tipo</TableHead>
                    <TableHead className="text-zinc-400 font-semibold">Categoria</TableHead>
                    <TableHead className="text-zinc-400 font-semibold">Data</TableHead>
                    <TableHead className="text-zinc-400 font-semibold text-right">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((t) => (
                    <TableRow key={t.id} className="border-b border-zinc-800/60 hover:bg-zinc-900/20">
                      <TableCell className="font-medium text-white">{t.description}</TableCell>
                      <TableCell>
                        <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${
                          t.type === 'receita' ? 'bg-emerald-950 text-emerald-400' : 'bg-red-950 text-red-400'
                        }`}>
                          {t.type === 'receita' ? 'Entrada' : 'Saída'}
                        </span>
                      </TableCell>
                      <TableCell className="text-zinc-400 text-xs">{t.category}</TableCell>
                      <TableCell className="text-zinc-400 text-xs">{new Date(t.date).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell className={`text-right font-semibold ${t.type === 'receita' ? 'text-emerald-400' : 'text-red-400'}`}>
                        {t.type === 'receita' ? '+' : '-'} {t.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* --- 5. REPORTS MODULE --- */}
        {activeTab === 'relatorios' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white">Relatórios Operacionais e de Tráfego</h2>
              <p className="text-sm text-zinc-400">Principais métricas publicitárias das contas de marketing gerenciadas.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Meta Ads Campaign Summary Card */}
              <Card className="bg-[#1e1e24] border-zinc-800/80">
                <CardHeader>
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-zinc-400">Meta Ads Geral</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center border-b border-zinc-800/60 pb-2">
                    <span className="text-xs text-zinc-400">Orçamento Investido</span>
                    <span className="text-xs font-bold text-white">R$ 14.500,00</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-zinc-800/60 pb-2">
                    <span className="text-xs text-zinc-400">Impressões</span>
                    <span className="text-xs font-bold text-white">1.8M</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-zinc-800/60 pb-2">
                    <span className="text-xs text-zinc-400">Cliques (CTR)</span>
                    <span className="text-xs font-bold text-white">45.000 (2.5%)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-zinc-400">Custo por Lead (CPL)</span>
                    <span className="text-xs font-bold text-emerald-400">R$ 8,20</span>
                  </div>
                </CardContent>
              </Card>

              {/* Google Ads Campaign Summary Card */}
              <Card className="bg-[#1e1e24] border-zinc-800/80">
                <CardHeader>
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-zinc-400">Google Ads Geral</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center border-b border-zinc-800/60 pb-2">
                    <span className="text-xs text-zinc-400">Orçamento Investido</span>
                    <span className="text-xs font-bold text-white">R$ 18.200,00</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-zinc-800/60 pb-2">
                    <span className="text-xs text-zinc-400">Impressões</span>
                    <span className="text-xs font-bold text-white">920K</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-zinc-800/60 pb-2">
                    <span className="text-xs text-zinc-400">Cliques (CTR)</span>
                    <span className="text-xs font-bold text-white">68.000 (7.4%)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-zinc-400">Custo por Clique (CPC)</span>
                    <span className="text-xs font-bold text-white">R$ 1,45</span>
                  </div>
                </CardContent>
              </Card>

              {/* General Agency ROI Card */}
              <Card className="bg-[#1e1e24] border-zinc-800/80">
                <CardHeader>
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-zinc-400">Retorno Consolidado (ROI)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center border-b border-zinc-800/60 pb-2">
                    <span className="text-xs text-zinc-400">Faturamento Gerado</span>
                    <span className="text-xs font-bold text-white">R$ 145.000,00</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-zinc-800/60 pb-2">
                    <span className="text-xs text-zinc-400">Investimento Total</span>
                    <span className="text-xs font-bold text-white">R$ 32.700,00</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-zinc-400">ROI Geral da Agência</span>
                    <span className="text-xs font-bold text-emerald-400">4.43x</span>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* SEO & Report advice */}
            <Card className="bg-[#1e1e24] border-zinc-800/80 p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-white">Otimização de SEO Geral Ativa</h4>
                  <p className="text-xs text-zinc-400 mt-1">
                    Todos os módulos internos do Portal.Achei foram projetados com tags semânticas completas, SEO interno aprimorado e tempos de resposta no cliente inferiores a 100ms para maximizar a usabilidade da equipe interna.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* --- 7. ADS MANAGEMENT / GESTAO ADS MODULE --- */}
        {activeTab === 'ads' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-white">Central de Gestão Ads (Google Ads)</h2>
                <p className="text-sm text-zinc-400">Métricas consolidadas de campanhas no Google Ads de cada cliente ativo.</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => handleExportAdsCSV()} className="bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold gap-1.5 cursor-pointer border border-zinc-700/50">
                  <Download className="w-3.5 h-3.5" /> Todos (CSV)
                </Button>
                <Button onClick={() => handleExportAdsPDF()} className="bg-zinc-100 hover:bg-zinc-200 text-zinc-950 text-xs font-semibold gap-1.5 cursor-pointer">
                  <Download className="w-3.5 h-3.5" /> Todos (PDF)
                </Button>
              </div>
            </div>

            {/* Google Ads client performance metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {clients
                .filter(c => c.status === 'Ativo')
                .map((client) => {
                  // Generate deterministically mock metrics based on client id/name
                  const seed = client.name.length;
                  const impressions = seed * 45000 + 10000;
                  const clicks = Math.round(impressions * (seed * 0.008 + 0.02));
                  const investment = Math.round(client.contractValue * 0.6); // Weekly investment
                  const cpc = Number((investment / clicks).toFixed(2));
                  const conversions = Math.round(clicks * 0.12);
                  const cpa = Number((investment / conversions).toFixed(2));

                  return (
                    <Card key={client.id} className="bg-[#1e1e24] border-zinc-800/80">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-sm font-semibold text-white">{client.name}</CardTitle>
                            <CardDescription className="text-xs text-zinc-500 mt-0.5">{client.serviceType}</CardDescription>
                          </div>
                          <span className="text-[10px] bg-blue-950 text-blue-400 border border-blue-900/50 px-2 py-0.5 rounded font-semibold uppercase">
                            Google Ads
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3.5">
                        {/* Metric lines */}
                        <div className="grid grid-cols-2 gap-4 pb-3 border-b border-zinc-800/40">
                          <div>
                            <p className="text-[10px] uppercase font-bold text-zinc-500">Impressões</p>
                            <p className="text-sm font-bold text-white mt-0.5">{impressions.toLocaleString('pt-BR')}</p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase font-bold text-zinc-500">Cliques</p>
                            <p className="text-sm font-bold text-white mt-0.5">{clicks.toLocaleString('pt-BR')}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pb-3 border-b border-zinc-800/40">
                          <div>
                            <p className="text-[10px] uppercase font-bold text-zinc-500">CPC Médio</p>
                            <p className="text-sm font-bold text-white mt-0.5">
                              {cpc.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase font-bold text-zinc-500">Conversões</p>
                            <p className="text-sm font-bold text-white mt-0.5">{conversions.toLocaleString('pt-BR')}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-[10px] uppercase font-bold text-zinc-500">Cálculo CPA</p>
                            <p className="text-sm font-bold text-emerald-400 mt-0.5">
                              {cpa.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase font-bold text-zinc-500">Investimento Semanal</p>
                            <p className="text-sm font-bold text-white mt-0.5">
                              {investment.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </p>
                          </div>
                        </div>
                        
                        {/* Individual Export Actions */}
                        <div className="grid grid-cols-2 gap-2 pt-3.5 border-t border-zinc-800/40">
                          <button
                            type="button"
                            onClick={() => handleExportAdsCSV(client)}
                            className="flex items-center justify-center gap-1 py-1.5 px-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-850 text-[10px] font-semibold text-zinc-300 rounded transition cursor-pointer"
                          >
                            <Download className="w-3 h-3 text-zinc-500" /> Exportar CSV
                          </button>
                          <button
                            type="button"
                            onClick={() => handleExportAdsPDF(client)}
                            className="flex items-center justify-center gap-1 py-1.5 px-2 bg-zinc-800 hover:bg-zinc-700 text-[10px] font-semibold text-white rounded transition cursor-pointer"
                          >
                            <Download className="w-3 h-3" /> Exportar PDF
                          </button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          </div>
        )}

        {/* --- 6. SETTINGS / CONFIGURACOES MODULE --- */}
        {activeTab === 'configuracoes' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white">Configurações do Portal</h2>
              <p className="text-sm text-zinc-400">Preferências do sistema, permissões e dados da agência.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Profile Card */}
              <Card className="bg-[#1e1e24] border-zinc-800/80">
                <CardHeader>
                  <CardTitle className="text-sm font-semibold text-white">Perfil do Usuário</CardTitle>
                  <CardDescription className="text-zinc-500">Seus dados de acesso e nível de privilégio no sistema.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-zinc-400">Nome Completo</Label>
                    <Input disabled value={user.name} className="bg-zinc-950 border-zinc-800 text-zinc-300" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-zinc-400">E-mail Corporativo</Label>
                    <Input disabled value={user.email} className="bg-zinc-950 border-zinc-800 text-zinc-300" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-zinc-400">Nível de Permissão</Label>
                    <Input disabled value={user.role} className="bg-zinc-950 border-zinc-800 text-zinc-300" />
                  </div>
                </CardContent>
              </Card>

              {/* Agency Settings Card */}
              <Card className="bg-[#1e1e24] border-zinc-800/80">
                <CardHeader>
                  <CardTitle className="text-sm font-semibold text-white">Configurações da Agência</CardTitle>
                  <CardDescription className="text-zinc-500">Altere as metas e dados corporativos exibidos no painel.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-zinc-400">Nome Fantasia da Agência</Label>
                    <Input placeholder="Agência Achei Marketing" defaultValue="Achei Marketing" className="bg-zinc-950 border-zinc-800 text-white" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-zinc-400">Meta Faturamento Mensal (R$)</Label>
                    <Input type="number" defaultValue="50000" className="bg-zinc-950 border-zinc-800 text-white" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-zinc-400">Fuso Horário do Dashboard</Label>
                    <Select defaultValue="America/Sao_Paulo">
                      <SelectTrigger className="bg-zinc-950 border-zinc-800 text-white">
                        <SelectValue placeholder="Fuso horário" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border border-zinc-800 text-white">
                        <SelectItem value="America/Sao_Paulo">Brasília (GMT-3)</SelectItem>
                        <SelectItem value="America/New_York">Nova York (GMT-5)</SelectItem>
                        <SelectItem value="Europe/London">Londres (GMT+0)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Database Status Card */}
              <Card className="bg-[#1e1e24] border-zinc-800/80 md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-sm font-semibold text-white">Status da Conexão e Banco de Dados</CardTitle>
                  <CardDescription className="text-zinc-500">Métricas técnicas de infraestrutura do Portal.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 bg-zinc-950/60 border border-zinc-850 rounded-xl gap-3 text-xs">
                    <div>
                      <p className="font-semibold text-white flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 inline-block animate-pulse"></span>
                        Modo Sandbox Ativo (Mock PostgreSQL)
                      </p>
                      <p className="text-zinc-500 mt-1">Todos os dados inseridos estão sendo persistidos no localStorage do seu navegador.</p>
                    </div>
                    <Button variant="outline" className="border-zinc-800 hover:bg-zinc-800 text-zinc-300 text-xs shrink-0 cursor-not-allowed">
                      Conectar PostgreSQL Produção
                    </Button>
                  </div>
                </CardContent>
              </Card>

            </div>
          </div>
        )}
        
      </main>
      </div>
    </div>
  );
}
