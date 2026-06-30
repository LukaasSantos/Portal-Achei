'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/authContext';
import { useRouter } from 'next/navigation';
import { mockDb, Client, Lead, Transaction, FormSubmission, ServiceGroup, Proposal, ProposalItem, Collaborator } from '@/lib/mockDb';
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
  Download,
  Check,
  X,
  FileText,
  Inbox,
  ChevronRight,
  ChevronDown,
  Trash2,
  Palette,
  Sparkles,
  Layers,
  Sliders,
  Type,
  Shield,
  Eye,
  RefreshCw,
  Pencil
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function DashboardPage() {
  const { user, logout, loading: authLoading } = useAuth();
  const router = useRouter();
  
  // Navigation State
  const [activeTab, setActiveTab] = useState<'overview' | 'clients' | 'comercial' | 'financeiro' | 'relatorios' | 'configuracoes' | 'ads' | 'colaboradores'>('overview');
  
  // Data States
  const [clients, setClients] = useState<Client[]>([]);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isEditClientDialogOpen, setIsEditClientDialogOpen] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [selectedReportClientId, setSelectedReportClientId] = useState<string>('');
  const [expandedMonths, setExpandedMonths] = useState<{[key: string]: boolean}>({});
  const [availableServices, setAvailableServices] = useState<string[]>([]);
  const [serviceGroups, setServiceGroups] = useState<ServiceGroup[]>([]);
  const [newServiceName, setNewServiceName] = useState('');
  
  // Service Group State
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedGroupServices, setSelectedGroupServices] = useState<string[]>([]);
  
  // Settings Tabs State
  const [activeSettingsSubTab, setActiveSettingsSubTab] = useState<'profile_corp' | 'services' | 'appearance' | 'audit' | 'database'>('profile_corp');
  
  // Appearance State
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg'>('base');
  const [accentColor, setAccentColor] = useState<'emerald' | 'blue' | 'purple' | 'zinc'>('zinc');

  // Ads Update States
  const [adsUpdateDate, setAdsUpdateDate] = useState<string>(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  });
  const [comparisonPeriod, setComparisonPeriod] = useState<'agora' | '7' | '14' | '21' | '30'>('7');
  const [isRefreshingAds, setIsRefreshingAds] = useState(false);
  const [adsRandomMultiplier, setAdsRandomMultiplier] = useState(1);

  // Manual Ads States
  const [selectedAdsMonths, setSelectedAdsMonths] = useState<Record<string, string>>({}); // clientId -> selectedMonth
  const [manualAdsData, setManualAdsData] = useState<Record<string, Record<string, { impressions: number; clicks: number; investment: number; conversions: number }>>>({});
  const [editingAdsClient, setEditingAdsClient] = useState<{ clientId: string; clientName: string; month: string; impressions: number; clicks: number; investment: number; conversions: number } | null>(null);
  const [isEditAdsDialogOpen, setIsEditAdsDialogOpen] = useState(false);

  const handleRefreshAds = () => {
    setIsRefreshingAds(true);
    setTimeout(() => {
      setAdsRandomMultiplier(0.95 + Math.random() * 0.1);
      setComparisonPeriod('agora');
      setIsRefreshingAds(false);
    }, 850);
  };

  // Corporate Info Settings State
  const [corpInfo, setCorpInfo] = useState({
    razaoSocial: 'Achei Publicidade Ltda',
    cnpj: '12.345.678/0001-90',
    metaFaturamento: '50000',
    timezone: 'America/Sao_Paulo'
  });

  // Simulated Audit Logs
  const [auditLogs, setAuditLogs] = useState<{ id: string; user: string; action: string; timestamp: string }[]>([
    { id: '1', user: 'Lucas Tas', action: 'Login no sistema', timestamp: new Date(Date.now() - 3600000 * 2).toISOString() },
    { id: '2', user: 'Dálete Achei', action: 'Visualizou relatório mensal Coca Cola BR', timestamp: new Date(Date.now() - 3600000 * 5).toISOString() },
    { id: '3', user: 'Lucas Tas', action: 'Aprovou relatório Coca Cola BR', timestamp: new Date(Date.now() - 3600000 * 6).toISOString() }
  ]);

  // Dialog Open States
  const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);
  const [isLeadDialogOpen, setIsLeadDialogOpen] = useState(false);
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false);
  const [isProposalDialogOpen, setIsProposalDialogOpen] = useState(false);

  // Form Fields
  // Client Form
  const [newClient, setNewClient] = useState({ name: '', email: '', phone: '', contractValue: '', status: 'Ativo' as any, serviceType: '' });
  // Lead Form
  const [newLead, setNewLead] = useState({ name: '', company: '', email: '', value: '', status: 'new' as any, notes: '' });
  // Transaction Form
  const [newTransaction, setNewTransaction] = useState({ description: '', amount: '', type: 'receita' as any, category: '' });

  // Proposal Form & States
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [financeiroSubTab, setFinanceiroSubTab] = useState<'fluxo' | 'propostas'>('fluxo');
  const [newProposal, setNewProposal] = useState({
    proposalNumber: '',
    date: '',
    validityDate: '',
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    observations: 'Forma de pagamento: Boleto ou Pix\nDesconto: R$ 0,00\nObs.: Pagamento à vista ou faturado.'
  });
  const [proposalItems, setProposalItems] = useState<ProposalItem[]>([{ name: '', quantity: 1, price: 0 }]);
  const [selectedEntityId, setSelectedEntityId] = useState<string>('');

  // Collaborators & Proposal Editing States
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [isCollaboratorDialogOpen, setIsCollaboratorDialogOpen] = useState(false);
  const [newCollaborator, setNewCollaborator] = useState({ name: '', role: 'dev', company: 'achei', email: '', phone: '' });
  const [editingProposal, setEditingProposal] = useState<Proposal | null>(null);


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
    setSubmissions(mockDb.getSubmissions());
    setAvailableServices(mockDb.getServices());
    setServiceGroups(mockDb.getServiceGroups());
    setProposals(mockDb.getProposals());
    setCollaborators(mockDb.getCollaborators());
    
    // Load local font/color options if any
    const savedSize = localStorage.getItem('pref_font_size');
    const savedAccent = localStorage.getItem('pref_accent_color');
    const savedCorp = localStorage.getItem('pref_corp_info');
    const savedAdsData = localStorage.getItem('manual_ads_data');
    if (savedSize) setFontSize(savedSize as any);
    if (savedAccent) setAccentColor(savedAccent as any);
    if (savedCorp) setCorpInfo(JSON.parse(savedCorp));
    if (savedAdsData) setManualAdsData(JSON.parse(savedAdsData));
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

  const handleUpdateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient || !editingClient.name || !editingClient.email || !editingClient.contractValue || !editingClient.serviceType) return;

    const updated = clients.map(c => c.id === editingClient.id ? editingClient : c);
    setClients(updated);
    mockDb.saveClients(updated);
    setIsEditClientDialogOpen(false);
    setEditingClient(null);

    // Add audit log
    const log = {
      id: Math.random().toString(36).substring(2, 9),
      user: user.name,
      action: `Editou as informações do cliente: ${editingClient.name}`,
      timestamp: new Date().toISOString()
    };
    setAuditLogs(prev => [log, ...prev]);
  };

  const handleUpdateAdsMetrics = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAdsClient) return;

    const { clientId, month, impressions, clicks, investment, conversions } = editingAdsClient;
    const updated = {
      ...manualAdsData,
      [clientId]: {
        ...(manualAdsData[clientId] || {}),
        [month]: { impressions, clicks, investment, conversions }
      }
    };
    setManualAdsData(updated);
    localStorage.setItem('manual_ads_data', JSON.stringify(updated));
    setIsEditAdsDialogOpen(false);
    setEditingAdsClient(null);

    // Add audit log
    const log = {
      id: Math.random().toString(36).substring(2, 9),
      user: user.name,
      action: `Editou manualmente métricas de Ads do cliente para o período ${month}`,
      timestamp: new Date().toISOString()
    };
    setAuditLogs(prev => [log, ...prev]);
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

  const handleSelectEntityForAutofill = (entityId: string | null) => {
    if (!entityId || entityId === 'none') {
      setSelectedEntityId('');
      return;
    }
    setSelectedEntityId(entityId);

    // Check if it is a client
    const foundClient = clients.find(c => c.id === entityId);
    if (foundClient) {
      setNewProposal(prev => ({
        ...prev,
        clientName: foundClient.name,
        clientPhone: foundClient.phone,
        clientEmail: foundClient.email
      }));
      return;
    }

    // Check if it is a lead
    const foundLead = leads.find(l => l.id === entityId);
    if (foundLead) {
      setNewProposal(prev => ({
        ...prev,
        clientName: foundLead.name,
        clientPhone: '(00) 00000-0000',
        clientEmail: foundLead.email
      }));
      return;
    }
  };

  const handleAddProposal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProposal.clientName || !newProposal.proposalNumber || !newProposal.date || !newProposal.validityDate) {
      alert('Por favor, preencha os campos obrigatórios: Nº do Orçamento, Cliente, Data e Validade.');
      return;
    }

    const itemsToSave = proposalItems.filter(item => item.name.trim() !== '');
    if (itemsToSave.length === 0) {
      alert('Adicione pelo menos um item à proposta.');
      return;
    }

    const subtotal = itemsToSave.reduce((acc, item) => acc + (item.quantity * item.price), 0);
    // Extract discount or default to 0
    const observationsDiscount = parseFloat((newProposal as any).discount || '0');
    let discount = 0;
    if (!isNaN(observationsDiscount)) {
      discount = observationsDiscount;
    }
    const total = Math.max(0, subtotal - discount);

    let updated: Proposal[];
    if (editingProposal) {
      // Editing Mode
      const updatedProp: Proposal = {
        ...editingProposal,
        proposalNumber: newProposal.proposalNumber,
        date: newProposal.date,
        validityDate: newProposal.validityDate,
        clientName: newProposal.clientName,
        clientPhone: newProposal.clientPhone || '(00) 00000-0000',
        clientEmail: newProposal.clientEmail || '',
        items: itemsToSave,
        subtotal,
        discount,
        total,
        observations: newProposal.observations
      };
      updated = proposals.map(p => p.id === editingProposal.id ? updatedProp : p);
    } else {
      // Creation Mode
      const proposalToAdd: Proposal = {
        id: 'p_' + Math.random().toString(36).substring(2, 9),
        proposalNumber: newProposal.proposalNumber,
        date: newProposal.date,
        validityDate: newProposal.validityDate,
        clientName: newProposal.clientName,
        clientPhone: newProposal.clientPhone || '(00) 00000-0000',
        clientEmail: newProposal.clientEmail || '',
        items: itemsToSave,
        subtotal,
        discount,
        total,
        observations: newProposal.observations,
        createdAt: new Date().toISOString()
      };
      updated = [proposalToAdd, ...proposals];
    }

    setProposals(updated);
    mockDb.saveProposals(updated);
    setIsProposalDialogOpen(false);
    
    // Reset form
    setNewProposal({
      proposalNumber: '',
      date: new Date().toISOString().split('T')[0],
      validityDate: '',
      clientName: '',
      clientPhone: '',
      clientEmail: '',
      observations: 'Forma de pagamento: Boleto ou Pix\nDesconto: R$ 0,00\nObs.: Pagamento à vista ou faturado.',
      discount: '0'
    } as any);
    setProposalItems([{ name: '', quantity: 1, price: 0 }]);
    setSelectedEntityId('');
    setEditingProposal(null);

    // Add audit log
    const log = {
      id: Math.random().toString(36).substring(2, 9),
      user: user.name,
      action: editingProposal 
        ? `Editou a proposta comercial Nº ${newProposal.proposalNumber} de: ${newProposal.clientName}`
        : `Criou a proposta comercial Nº ${newProposal.proposalNumber} para: ${newProposal.clientName}`,
      timestamp: new Date().toISOString()
    };
    setAuditLogs(prev => [log, ...prev]);
  };

  const handleEditProposalTrigger = (proposal: Proposal) => {
    setEditingProposal(proposal);
    setNewProposal({
      proposalNumber: proposal.proposalNumber,
      date: proposal.date,
      validityDate: proposal.validityDate,
      clientName: proposal.clientName,
      clientPhone: proposal.clientPhone,
      clientEmail: proposal.clientEmail,
      observations: proposal.observations,
      discount: proposal.discount.toString()
    } as any);
    setProposalItems(proposal.items);
    setSelectedEntityId('');
    setIsProposalDialogOpen(true);
  };

  const handleDeleteProposal = (id: string) => {
    if (!confirm('Deseja realmente excluir esta proposta comercial?')) return;
    const propToDelete = proposals.find(p => p.id === id);
    const updated = proposals.filter(p => p.id !== id);
    setProposals(updated);
    mockDb.saveProposals(updated);

    if (propToDelete) {
      // Add audit log
      const log = {
        id: Math.random().toString(36).substring(2, 9),
        user: user.name,
        action: `Excluiu a proposta comercial Nº ${propToDelete.proposalNumber} (${propToDelete.clientName})`,
        timestamp: new Date().toISOString()
      };
      setAuditLogs(prev => [log, ...prev]);
    }
  };

  const handleAddCollaborator = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCollaborator.name || !newCollaborator.role || !newCollaborator.company) {
      alert('Preencha os campos obrigatórios: Nome, Função e Empresa.');
      return;
    }
    const collaboratorToAdd: Collaborator = {
      id: 'col_' + Math.random().toString(36).substring(2, 9),
      name: newCollaborator.name,
      role: newCollaborator.role,
      company: newCollaborator.company,
      email: newCollaborator.email || undefined,
      phone: newCollaborator.phone || undefined
    };
    const updated = [...collaborators, collaboratorToAdd];
    setCollaborators(updated);
    mockDb.saveCollaborators(updated);
    setIsCollaboratorDialogOpen(false);
    setNewCollaborator({ name: '', role: 'dev', company: 'achei', email: '', phone: '' });

    // Add audit log
    const log = {
      id: Math.random().toString(36).substring(2, 9),
      user: user.name,
      action: `Cadastrou o colaborador: ${collaboratorToAdd.name} (${collaboratorToAdd.role.toUpperCase()} - ${collaboratorToAdd.company.toUpperCase()})`,
      timestamp: new Date().toISOString()
    };
    setAuditLogs(prev => [log, ...prev]);
  };

  const handleDeleteCollaborator = (id: string) => {
    if (!confirm('Deseja realmente remover este colaborador?')) return;
    const colToDelete = collaborators.find(c => c.id === id);
    const updated = collaborators.filter(c => c.id !== id);
    setCollaborators(updated);
    mockDb.saveCollaborators(updated);

    if (colToDelete) {
      const log = {
        id: Math.random().toString(36).substring(2, 9),
        user: user.name,
        action: `Removeu o colaborador: ${colToDelete.name}`,
        timestamp: new Date().toISOString()
      };
      setAuditLogs(prev => [log, ...prev]);
    }
  };

  const handleExportProposalPDF = (proposal: Proposal) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const formatDateStr = (dateStr: string) => {
      if (!dateStr) return '';
      const parts = dateStr.split('-');
      if (parts.length !== 3) return dateStr;
      const [year, month, day] = parts;
      return `${day}/${month}/${year}`;
    };

    const formatCurrency = (val: number) => {
      return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    let itemsHtml = '';
    proposal.items.forEach((item, index) => {
      let displayName = item.name;
      if (item.collaboratorId) {
        const col = collaborators.find(c => c.id === item.collaboratorId);
        if (col) {
          displayName += ` (${col.company.toUpperCase()} - ${col.name})`;
        }
      }
      itemsHtml += `
        <tr>
          <td style="text-align: center; border-right: 1px solid #d1d5db; padding: 8px;">${index + 1}</td>
          <td style="border-right: 1px solid #d1d5db; padding: 8px;">${displayName}</td>
          <td style="text-align: center; border-right: 1px solid #d1d5db; padding: 8px;">${item.quantity}</td>
          <td style="text-align: right; border-right: 1px solid #d1d5db; padding: 8px;">${formatCurrency(item.price)}</td>
          <td style="text-align: right; padding: 8px;">${formatCurrency(item.quantity * item.price)}</td>
        </tr>
      `;
    });

    const obsHtml = proposal.observations
      .split('\n')
      .map(line => `<div>${line}</div>`)
      .join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Orçamento ${proposal.proposalNumber}</title>
        <meta charset="utf-8">
        <style>
          body {
            font-family: Arial, Helvetica, sans-serif;
            color: #1f2937;
            background-color: #ffffff;
            margin: 0;
            padding: 20px;
            font-size: 11px;
            line-height: 1.4;
          }
          
          /* Container styling matching the layout grid precisely */
          .section {
            border: 1px solid #d1d5db;
            margin-bottom: 12px;
          }
          
          .grid-3 {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            text-align: center;
          }
          .grid-3 > div {
            padding: 10px;
            font-weight: bold;
          }
          .grid-3 > div:not(:last-child) {
            border-right: 1px solid #d1d5db;
          }

          /* Header style */
          .header-container {
            display: flex;
            align-items: stretch;
            border: 1px solid #d1d5db;
            margin-bottom: 12px;
          }
          .logo-box {
            background-color: #000000;
            color: #ffffff;
            width: 110px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 15px 10px;
            font-family: sans-serif;
            border-right: 1px solid #d1d5db;
          }
          .logo-box .brand {
            font-size: 26px;
            font-weight: 900;
            letter-spacing: -1px;
            line-height: 1;
          }
          .logo-box .sub {
            font-size: 5px;
            letter-spacing: 1px;
            margin-top: 4px;
            opacity: 0.8;
            font-weight: bold;
          }
          .header-info {
            flex: 1;
            padding: 10px 15px;
            display: flex;
            justify-content: space-between;
          }
          .header-left {
            display: flex;
            flex-direction: column;
            justify-content: center;
          }
          .header-left .company-name {
            font-size: 13px;
            font-weight: bold;
            margin-bottom: 2px;
          }
          .header-right {
            display: flex;
            flex-direction: column;
            justify-content: center;
            text-align: right;
          }
          
          /* Titles */
          .section-title {
            background-color: #f9fafb;
            text-align: center;
            font-weight: bold;
            padding: 5px;
            border-bottom: 1px solid #d1d5db;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            font-size: 11px;
          }

          /* Client Data */
          .client-grid {
            display: grid;
            grid-template-columns: 80px 1fr;
          }
          .client-cell-label {
            padding: 8px;
            font-weight: bold;
            border-right: 1px solid #d1d5db;
            background-color: #f9fafb;
          }
          .client-cell-value {
            padding: 8px;
          }
          .client-border-bottom {
            border-bottom: 1px solid #d1d5db;
          }
          .client-sub-grid {
            display: grid;
            grid-template-columns: 80px 1fr 60px 1fr;
          }

          /* Table Items */
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th {
            background-color: #f9fafb;
            font-weight: bold;
            padding: 6px 8px;
            border-bottom: 1px solid #d1d5db;
            text-align: left;
            font-size: 10px;
          }
          th:not(:last-child), td:not(:last-child) {
            border-right: 1px solid #d1d5db;
          }
          
          /* Footer grid totals */
          .totals-grid {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            border-top: 1px solid #d1d5db;
            text-align: center;
            background-color: #f9fafb;
          }
          .totals-grid > div {
            padding: 8px;
            font-weight: bold;
            font-size: 11px;
          }
          .totals-grid > div:not(:last-child) {
            border-right: 1px solid #d1d5db;
          }

          /* Observations */
          .obs-content {
            padding: 10px;
            font-size: 10px;
            white-space: pre-line;
            color: #374151;
          }

          /* Signatures */
          .signatures-container {
            display: grid;
            grid-template-columns: 1fr 1fr;
            column-gap: 40px;
            margin-top: 60px;
            padding: 0 10px;
          }
          .signature-box {
            text-align: center;
          }
          .signature-line {
            border-top: 1px solid #9ca3af;
            margin-bottom: 4px;
          }
          .signature-title {
            font-weight: bold;
            color: #4b5563;
          }

          @media print {
            body {
              padding: 0;
            }
            .no-print {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <!-- Header -->
        <div class="header-container">
          <div class="logo-box">
            <div class="brand">Achei</div>
            <div class="sub">DIGITAL MARKETING</div>
          </div>
          <div class="header-info">
            <div class="header-left">
              <div class="company-name">Achei Digital Marketing</div>
              <div>CNPJ 49.042.375/0001-03</div>
              <div>Rua Laranjal do Jari, 130 181 torre A</div>
              <div style="font-size: 9px; color: #6b7280;">Ponto de referência: Atacadão - Centro Esportivo</div>
            </div>
            <div class="header-right">
              <div style="font-weight: bold;">(11) 9187-0233</div>
              <div>acheiglobalmetadigital@gmail.com</div>
              <div>www.acheidigitalmarketing.com.br</div>
            </div>
          </div>
        </div>

        <!-- Budget Meta Info -->
        <div class="section grid-3">
          <div>Orçamento: ${proposal.proposalNumber}</div>
          <div>Data: ${formatDateStr(proposal.date)}</div>
          <div>Validade: ${formatDateStr(proposal.validityDate)}</div>
        </div>

        <!-- Client Info -->
        <div class="section">
          <div class="section-title">Dados do cliente</div>
          <div class="client-grid client-border-bottom">
            <div class="client-cell-label">Nome</div>
            <div class="client-cell-value" style="font-weight: bold;">${proposal.clientName}</div>
          </div>
          <div class="client-sub-grid">
            <div class="client-cell-label">Telefone</div>
            <div class="client-cell-value" style="border-right: 1px solid #d1d5db;">${proposal.clientPhone}</div>
            <div class="client-cell-label">E-mail</div>
            <div class="client-cell-value">${proposal.clientEmail}</div>
          </div>
        </div>

        <!-- Items Table -->
        <div class="section">
          <div class="section-title" style="border-bottom: 1px solid #d1d5db;">Itens</div>
          <table>
            <thead>
              <tr>
                <th style="width: 40px; text-align: center;">#</th>
                <th>Nome</th>
                <th style="width: 50px; text-align: center;">Qtd.</th>
                <th style="width: 100px; text-align: right;">Valor</th>
                <th style="width: 100px; text-align: right;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          
          <!-- Totals Row -->
          <div class="totals-grid">
            <div>Subtotal: ${formatCurrency(proposal.subtotal)}</div>
            <div>Desconto: ${formatCurrency(proposal.discount)}</div>
            <div style="color: #111827;">Total: ${formatCurrency(proposal.total)}</div>
          </div>
        </div>

        <!-- Observations -->
        <div class="section">
          <div class="section-title">Observações</div>
          <div class="obs-content">
            ${obsHtml}
          </div>
        </div>

        <!-- Signatures -->
        <div class="signatures-container">
          <div class="signature-box">
            <div class="signature-line"></div>
            <div class="signature-title">Achei Digital Marketing</div>
          </div>
          <div class="signature-box">
            <div class="signature-line"></div>
            <div class="signature-title">${proposal.clientName}</div>
          </div>
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

  const handleApproveSubmission = (id: string) => {
    const updated = submissions.map(sub => sub.id === id ? { ...sub, status: 'approved' as const } : sub);
    setSubmissions(updated);
    mockDb.saveSubmissions(updated);
  };

  const handleDenySubmission = (id: string) => {
    const updated = submissions.map(sub => sub.id === id ? { ...sub, status: 'rejected' as const } : sub);
    setSubmissions(updated);
    mockDb.saveSubmissions(updated);
  };

  const toggleMonthExpand = (monthName: string) => {
    setExpandedMonths(prev => ({
      ...prev,
      [monthName]: !prev[monthName]
    }));
  };

  const handleAddService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceName.trim()) return;
    if (availableServices.includes(newServiceName.trim())) return;
    const updated = [...availableServices, newServiceName.trim()];
    setAvailableServices(updated);
    mockDb.saveServices(updated);
    
    // Add audit log
    const log = {
      id: Math.random().toString(36).substring(2, 9),
      user: user.name,
      action: `Adicionou o serviço: ${newServiceName.trim()}`,
      timestamp: new Date().toISOString()
    };
    setAuditLogs(prev => [log, ...prev]);
    setNewServiceName('');
  };

  const handleDeleteService = (serviceToDelete: string) => {
    const updated = availableServices.filter(s => s !== serviceToDelete);
    setAvailableServices(updated);
    mockDb.saveServices(updated);

    // Filter service groups containing this service to remove that service reference
    const updatedGroups = serviceGroups.map(g => ({
      ...g,
      services: g.services.filter(s => s !== serviceToDelete)
    })).filter(g => g.services.length > 0);
    setServiceGroups(updatedGroups);
    mockDb.saveServiceGroups(updatedGroups);

    // Add audit log
    const log = {
      id: Math.random().toString(36).substring(2, 9),
      user: user.name,
      action: `Removeu o serviço: ${serviceToDelete}`,
      timestamp: new Date().toISOString()
    };
    setAuditLogs(prev => [log, ...prev]);
  };

  const handleAddServiceGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim() || selectedGroupServices.length === 0) return;
    if (serviceGroups.some(g => g.name.toLowerCase() === newGroupName.trim().toLowerCase())) return;

    const groupToAdd: ServiceGroup = {
      id: 'g_' + Math.random().toString(36).substring(2, 9),
      name: newGroupName.trim(),
      services: selectedGroupServices
    };

    const updated = [...serviceGroups, groupToAdd];
    setServiceGroups(updated);
    mockDb.saveServiceGroups(updated);

    // Add audit log
    const log = {
      id: Math.random().toString(36).substring(2, 9),
      user: user.name,
      action: `Criou grupo de serviços: ${newGroupName.trim()} contendo [${selectedGroupServices.join(', ')}]`,
      timestamp: new Date().toISOString()
    };
    setAuditLogs(prev => [log, ...prev]);

    setNewGroupName('');
    setSelectedGroupServices([]);
  };

  const handleDeleteServiceGroup = (groupId: string) => {
    const group = serviceGroups.find(g => g.id === groupId);
    const updated = serviceGroups.filter(g => g.id !== groupId);
    setServiceGroups(updated);
    mockDb.saveServiceGroups(updated);

    if (group) {
      // Add audit log
      const log = {
        id: Math.random().toString(36).substring(2, 9),
        user: user.name,
        action: `Removeu o grupo de serviços: ${group.name}`,
        timestamp: new Date().toISOString()
      };
      setAuditLogs(prev => [log, ...prev]);
    }
  };

  const handleSaveCorpInfo = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('pref_corp_info', JSON.stringify(corpInfo));
    
    // Add audit log
    const log = {
      id: Math.random().toString(36).substring(2, 9),
      user: user.name,
      action: `Atualizou os dados corporativos da agência`,
      timestamp: new Date().toISOString()
    };
    setAuditLogs(prev => [log, ...prev]);

    alert('Dados corporativos atualizados com sucesso!');
  };

  const handleFontSizeChange = (size: 'sm' | 'base' | 'lg') => {
    setFontSize(size);
    localStorage.setItem('pref_font_size', size);
  };

  const handleAccentColorChange = (color: 'emerald' | 'blue' | 'purple' | 'zinc') => {
    setAccentColor(color);
    localStorage.setItem('pref_accent_color', color);
  };

  const handleExportSubmission = (submission: FormSubmission) => {
    // Find client details to seed comparative stats
    const clientObj = clients.find(c => c.id === submission.clientId);
    const seed = clientObj ? clientObj.name.length : 10;
    
    // Sort all client's approved submissions to find baseline
    const clientApproved = [...submissions]
      .filter(s => s.status === 'approved' && s.clientId === submission.clientId)
      .sort((a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime());
    
    const currentIdx = clientApproved.findIndex(item => item.id === submission.id);
    const firstSub = clientApproved[0];

    let adsComparisonText = '';
    if (currentIdx > 0 && firstSub) {
      const firstWeeklyInvestment = Math.round(submission.leadCampaign.length * 120 + seed * 100);
      const firstWeeklyClicks = Math.round(firstWeeklyInvestment / (seed * 0.08 + 1.2));
      const firstConversions = Math.round(firstWeeklyClicks * 0.10);
      const firstCpa = Number((firstWeeklyInvestment / (firstConversions || 1)).toFixed(2));

      const factor = 1 + (currentIdx * 0.08);
      const currentWeeklyInvestment = Math.round(firstWeeklyInvestment * factor);
      const currentWeeklyClicks = Math.round(firstWeeklyClicks * (factor + 0.03));
      const currentConversions = Math.round(currentWeeklyClicks * 0.11);
      const currentCpa = Number((currentWeeklyInvestment / (currentConversions || 1)).toFixed(2));

      const investmentDiff = currentWeeklyInvestment - firstWeeklyInvestment;
      const conversionDiff = currentConversions - firstConversions;
      const cpaDiff = currentCpa - firstCpa;

      adsComparisonText = `3. DESEMPENHO GOOGLE ADS (COMPARADO COM A 1ª SEMANA)\n` +
        `----------------------------------------\n` +
        `   * Investimento Semanal: R$ ${currentWeeklyInvestment.toLocaleString('pt-BR')} (Diferença: ${investmentDiff >= 0 ? '+' : ''}R$ ${investmentDiff.toLocaleString('pt-BR')})\n` +
        `   * Conversões: ${currentConversions} Leads (Diferença: ${conversionDiff >= 0 ? '+' : ''}${conversionDiff})\n` +
        `   * CPA Médio: R$ ${currentCpa.toLocaleString('pt-BR')} (Diferença: ${cpaDiff >= 0 ? '+' : ''}R$ ${cpaDiff.toLocaleString('pt-BR')})\n\n`;
    } else {
      adsComparisonText = `3. DESEMPENHO GOOGLE ADS (CONVENÇÃO BASELINE)\n` +
        `----------------------------------------\n` +
        `   * Esta é a 1ª semana registrada de atualizações. As próximas semanas conterão análises comparativas automáticas de Google Ads.\n\n`;
    }

    let leadsText = '';
    if (submission.leads && submission.leads.length > 0) {
      submission.leads.forEach((l, idx) => {
        leadsText += `Lead #${idx + 1}:\n` +
          `  - Data do Contato: ${l.contactDate ? new Date(l.contactDate).toLocaleDateString('pt-BR') : 'N/A'}\n` +
          `  - Nome do Lead: ${l.name}\n` +
          `  - Telefone para Contato: ${l.phone}\n` +
          `  - Campanha: ${l.campaign}\n` +
          `  - Vendeu? ${l.sold}\n` +
          (l.sold === 'Não' ? `  - Motivo de não ter vendido: ${l.whyNotSold}\n` : '') +
          `\n`;
      });
    } else {
      leadsText = `Data do Contato: ${submission.leadContactDate ? new Date(submission.leadContactDate).toLocaleDateString('pt-BR') : 'N/A'}\n` +
        `Nome do Lead: ${submission.leadName}\n` +
        `Telefone para Contato: ${submission.leadPhone}\n` +
        `Campanha: ${submission.leadCampaign}\n` +
        `Vendeu? ${submission.leadSold}\n` +
        (submission.leadSold === 'Não' ? `Motivo de não ter vendido: ${submission.leadWhyNotSold}\n` : '') +
        `\n`;
    }

    const content = `RELATÓRIO OPERACIONAL - PORTAL ACHEI\n` +
      `========================================\n` +
      `ID do Relatório: ${submission.id}\n` +
      `Cliente: ${submission.clientName}\n` +
      `Mês de Referência: ${submission.month}\n` +
      `Data de Submissão: ${new Date(submission.submittedAt).toLocaleString('pt-BR')}\n` +
      `Status: Aprovado\n` +
      `========================================\n\n` +
      `1. VALIDAÇÃO DOS LEADS\n` +
      `----------------------------------------\n` +
      leadsText +
      `2. ATUALIZAÇÃO DE DADOS\n` +
      `----------------------------------------\n` +
      `Campanha de maior performance (Google): ${submission.topGoogleCampaign}\n` +
      `Palavras-Chaves Positivas mais pesquisadas: ${submission.topPositiveKeywords}\n` +
      `Palavras-Chave Negativas a atualizar: ${submission.negativeKeywordsToUpdate}\n` +
      `Observações do Comercial: ${submission.salesTeamObservations || 'Sem observações.'}\n\n` +
      adsComparisonText +
      `========================================\n`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio-${submission.clientName.toLowerCase().replace(/\s/g, '-')}-${submission.month.toLowerCase().replace(/\s/g, '-')}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportMonthlyConsolidated = (monthName: string, submissionsList: FormSubmission[]) => {
    const sorted = [...submissionsList].sort((a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime());
    
    let content = `PORTAL ACHEI - RELATÓRIO MENSAL CONSOLIDADO\n` +
      `==================================================\n` +
      `Cliente: ${sorted[0].clientName}\n` +
      `Mês de Referência: ${monthName}\n` +
      `Data de Exportação: ${new Date().toLocaleString('pt-BR')}\n` +
      `Total de Atualizações: ${sorted.length}\n` +
      `==================================================\n\n`;

    sorted.forEach((submission, index) => {
      // Find client details to seed comparative stats
      const clientObj = clients.find(c => c.id === submission.clientId);
      const seed = clientObj ? clientObj.name.length : 10;
      
      let adsConsolidatedText = '';
      if (index > 0) {
        const firstWeeklyInvestment = Math.round(submission.leadCampaign.length * 120 + seed * 100);
        const firstWeeklyClicks = Math.round(firstWeeklyInvestment / (seed * 0.08 + 1.2));
        const firstConversions = Math.round(firstWeeklyClicks * 0.10);
        const firstCpa = Number((firstWeeklyInvestment / (firstConversions || 1)).toFixed(2));

        const factor = 1 + (index * 0.08);
        const currentWeeklyInvestment = Math.round(firstWeeklyInvestment * factor);
        const currentWeeklyClicks = Math.round(firstWeeklyClicks * (factor + 0.03));
        const currentConversions = Math.round(currentWeeklyClicks * 0.11);
        const currentCpa = Number((currentWeeklyInvestment / (currentConversions || 1)).toFixed(2));

        const investmentDiff = currentWeeklyInvestment - firstWeeklyInvestment;
        const conversionDiff = currentConversions - firstConversions;
        const cpaDiff = currentCpa - firstCpa;

        adsConsolidatedText = `   * Google Ads: Inv. R$ ${currentWeeklyInvestment.toLocaleString('pt-BR')} (${investmentDiff >= 0 ? '+' : ''}R$ ${investmentDiff.toLocaleString('pt-BR')}) | Leads: ${currentConversions} (${conversionDiff >= 0 ? '+' : ''}${conversionDiff}) | CPA: R$ ${currentCpa.toLocaleString('pt-BR')} (${cpaDiff >= 0 ? '+' : ''}R$ ${cpaDiff.toLocaleString('pt-BR')})\n`;
      } else {
        adsConsolidatedText = `   * Google Ads: 1ª Atualização (Baseline de Referência)\n`;
      }

      let leadsText = '';
      if (submission.leads && submission.leads.length > 0) {
        submission.leads.forEach((l, idx) => {
          leadsText += `   * Lead #${idx + 1}:\n` +
            `     - Data do Contato: ${l.contactDate ? new Date(l.contactDate).toLocaleDateString('pt-BR') : 'N/A'}\n` +
            `     - Nome do Lead: ${l.name}\n` +
            `     - Telefone: ${l.phone}\n` +
            `     - Campanha: ${l.campaign}\n` +
            `     - Vendeu? ${l.sold}\n` +
            (l.sold === 'Não' ? `     - Motivo: ${l.whyNotSold}\n` : '') +
            `\n`;
        });
      } else {
        leadsText = `   * Data do Contato: ${submission.leadContactDate ? new Date(submission.leadContactDate).toLocaleDateString('pt-BR') : 'N/A'}\n` +
          `   * Nome do Lead: ${submission.leadName}\n` +
          `   * Telefone para Contato: ${submission.leadPhone}\n` +
          `   * Campanha: ${submission.leadCampaign}\n` +
          `   * Vendeu? ${submission.leadSold}\n` +
          (submission.leadSold === 'Não' ? `   * Motivo: ${submission.leadWhyNotSold}\n` : '') +
          `\n`;
      }

      content += `ATUALIZAÇÃO SEMANAL #${index + 1}\n` +
        `--------------------------------------------------\n` +
        `ID da Submissão: ${submission.id}\n` +
        `Data/Hora do Envio: ${new Date(submission.submittedAt).toLocaleString('pt-BR')}\n` +
        `--------------------------------------------------\n` +
        `1. VALIDAÇÃO DOS LEADS:\n` +
        leadsText +
        `2. ATUALIZAÇÃO DE DADOS:\n` +
        `   * Campanha de Destaque (Google): ${submission.topGoogleCampaign}\n` +
        `   * Keywords Positivas: ${submission.topPositiveKeywords}\n` +
        `   * Keywords Negativas: ${submission.negativeKeywordsToUpdate}\n` +
        (submission.salesTeamObservations ? `   * Obs. Comercial: ${submission.salesTeamObservations}\n` : '') +
        `\n` +
        `3. COMPARATIVO GOOGLE ADS:\n` +
        adsConsolidatedText +
        `\n` +
        `==================================================\n\n`;
    });

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
    const url2 = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url2);
    link.setAttribute('download', `consolidado-${sorted[0].clientName.toLowerCase().replace(/\s/g, '-')}-${monthName.toLowerCase().replace(/\s/g, '-')}.txt`);
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

  const fontSizeClassMap = {
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg'
  };

  return (
    <div className={`flex-grow flex min-h-screen bg-[#121214] ${fontSizeClassMap[fontSize]}`}>
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
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition ${
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
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition ${
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
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition ${
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
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition ${
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
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition ${
                activeTab === 'financeiro' 
                  ? 'bg-zinc-800 text-white font-semibold' 
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              Financeiro
            </button>
            <button
              onClick={() => setActiveTab('colaboradores')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition ${
                activeTab === 'colaboradores' 
                  ? 'bg-zinc-800 text-white font-semibold' 
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              Colaboradores
            </button>
            <button
              onClick={() => setActiveTab('relatorios')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition ${
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
                <DialogContent className="bg-zinc-900 border border-zinc-800 text-white max-w-md sm:max-w-lg w-[95vw]">
                  <DialogHeader>
                    <DialogTitle>Adicionar Novo Cliente</DialogTitle>
                    <DialogDescription className="text-zinc-400">Preencha os dados do cliente abaixo para adicioná-lo ao portfólio.</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddClient} className="space-y-4 py-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                        <Select 
                          value={newClient.serviceType} 
                          onValueChange={val => setNewClient({...newClient, serviceType: val || ''})}
                        >
                          <SelectTrigger className="bg-zinc-950 border-zinc-800 text-white">
                            <SelectValue placeholder="Selecione o serviço..." />
                          </SelectTrigger>
                          <SelectContent className="bg-zinc-900 border border-zinc-800 text-white">
                            <div className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-500">Serviços Individuais</div>
                            {availableServices.map(s => (
                              <SelectItem key={s} value={s}>{s}</SelectItem>
                            ))}
                            {serviceGroups.length > 0 && (
                              <>
                                <div className="h-px bg-zinc-800 my-1" />
                                <div className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-500">Grupos de Serviços</div>
                                {serviceGroups.map(g => (
                                  <SelectItem key={g.id} value={`[Grupo] ${g.name}`}>{g.name}</SelectItem>
                                ))}
                              </>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    <TableHead className="text-zinc-400 font-semibold text-right">Ações</TableHead>
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
                        <TableCell className="text-right">
                          <Button
                            onClick={() => {
                              setEditingClient(c);
                              setIsEditClientDialogOpen(true);
                            }}
                            variant="outline"
                            size="sm"
                            className="h-7 w-7 p-0 border-zinc-800 hover:bg-zinc-800 text-zinc-350 hover:text-white cursor-pointer"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>

            {/* Edit Client Dialog */}
            {editingClient && (
              <Dialog open={isEditClientDialogOpen} onOpenChange={setIsEditClientDialogOpen}>
                <DialogContent className="bg-zinc-900 border border-zinc-800 text-white max-w-md sm:max-w-lg w-[95vw]">
                  <DialogHeader>
                    <DialogTitle>Editar Cliente</DialogTitle>
                    <DialogDescription className="text-zinc-400">Atualize os dados cadastrais do cliente selecionado.</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleUpdateClient} className="space-y-4 py-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-c-name" className="text-zinc-300">Nome do Cliente/Empresa</Label>
                        <Input 
                          id="edit-c-name" 
                          value={editingClient.name} 
                          onChange={e => setEditingClient({...editingClient, name: e.target.value})} 
                          className="bg-zinc-950 border-zinc-800 text-white" 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-c-type" className="text-zinc-300">Serviço Prestado</Label>
                        <Select 
                          value={editingClient.serviceType} 
                          onValueChange={val => setEditingClient({...editingClient, serviceType: val || ''})}
                        >
                          <SelectTrigger className="bg-zinc-950 border-zinc-800 text-white">
                            <SelectValue placeholder="Selecione o serviço..." />
                          </SelectTrigger>
                          <SelectContent className="bg-zinc-900 border border-zinc-800 text-white">
                            <div className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-500">Serviços Individuais</div>
                            {availableServices.map(s => (
                              <SelectItem key={s} value={s}>{s}</SelectItem>
                            ))}
                            {serviceGroups.length > 0 && (
                              <>
                                <div className="h-px bg-zinc-800 my-1" />
                                <div className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-500">Grupos de Serviços</div>
                                {serviceGroups.map(g => (
                                  <SelectItem key={g.id} value={`[Grupo] ${g.name}`}>{g.name}</SelectItem>
                                ))}
                              </>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-c-email" className="text-zinc-300">E-mail</Label>
                        <Input 
                          id="edit-c-email" 
                          value={editingClient.email} 
                          onChange={e => setEditingClient({...editingClient, email: e.target.value})} 
                          className="bg-zinc-950 border-zinc-800 text-white" 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-c-phone" className="text-zinc-300">Telefone</Label>
                        <Input 
                          id="edit-c-phone" 
                          value={editingClient.phone} 
                          onChange={e => setEditingClient({...editingClient, phone: e.target.value})} 
                          className="bg-zinc-950 border-zinc-800 text-white" 
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-c-value" className="text-zinc-300">Valor Mensal do Contrato (R$)</Label>
                        <Input 
                          id="edit-c-value" 
                          type="number"
                          value={editingClient.contractValue} 
                          onChange={e => setEditingClient({...editingClient, contractValue: Number(e.target.value)})} 
                          className="bg-zinc-950 border-zinc-800 text-white" 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-c-status" className="text-zinc-300">Status</Label>
                        <Select 
                          value={editingClient.status} 
                          onValueChange={val => setEditingClient({...editingClient, status: (val || 'Ativo') as any})}
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
                        onClick={() => setIsEditClientDialogOpen(false)}
                        className="border-zinc-800 hover:bg-zinc-800 text-zinc-300"
                      >
                        Cancelar
                      </Button>
                      <Button type="submit" className="bg-zinc-100 hover:bg-zinc-200 text-zinc-950">
                        Salvar Alterações
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            )}
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
            <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-white">Módulo Financeiro</h2>
                <p className="text-sm text-zinc-400">Gerenciamento do caixa operacional e propostas comerciais da agência.</p>
              </div>

              <div className="flex border border-zinc-800 rounded-lg p-0.5 bg-zinc-950">
                <button
                  onClick={() => setFinanceiroSubTab('fluxo')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition cursor-pointer ${
                    financeiroSubTab === 'fluxo'
                      ? 'bg-zinc-800 text-white font-bold'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Fluxo de Caixa
                </button>
                <button
                  onClick={() => setFinanceiroSubTab('propostas')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition cursor-pointer ${
                    financeiroSubTab === 'propostas'
                      ? 'bg-zinc-800 text-white font-bold'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Propostas Comerciais
                </button>
              </div>
            </div>

            {/* --- SUB-TAB: FLUXO DE CAIXA --- */}
            {financeiroSubTab === 'fluxo' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold text-white">Livro Caixa</h3>
                    <p className="text-xs text-zinc-500">Lançamentos de receitas e despesas.</p>
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

            {/* --- SUB-TAB: PROPOSTAS COMERCIAIS --- */}
            {financeiroSubTab === 'propostas' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold text-white">Orçamentos e Propostas</h3>
                    <p className="text-xs text-zinc-500">Crie propostas comerciais premium com base no modelo corporativo.</p>
                  </div>

                  {/* Add Proposal Dialog */}
                  <Dialog open={isProposalDialogOpen} onOpenChange={(open) => {
                    setIsProposalDialogOpen(open);
                    if (open) {
                      // Generate proposal number and preset dates
                      const autoNum = Date.now().toString().substring(4, 12);
                      const todayStr = new Date().toISOString().split('T')[0];
                      const valDate = new Date();
                      valDate.setDate(valDate.getDate() + 3);
                      const valDateStr = valDate.toISOString().split('T')[0];
                      
                      setNewProposal({
                        proposalNumber: autoNum,
                        date: todayStr,
                        validityDate: valDateStr,
                        clientName: '',
                        clientPhone: '',
                        clientEmail: '',
                        observations: 'Forma de pagamento: Boleto ou Pix\nDesconto: R$ 0,00 - Fechando em conjunto\nObs.: Pagamento no primeiro mês.\n\nProjeção para 3 meses\nManutenção Site e criação de Blog R$600,00 mês\nTráfego Pago Google + Meta R$3500,00 mês (Negociável)',
                        discount: '0'
                      } as any);
                      setProposalItems([{ name: '', quantity: 1, price: 0 }]);
                      setSelectedEntityId('');
                    }
                  }}>
                    <DialogTrigger className="inline-flex items-center justify-center rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-950 text-xs font-semibold gap-1.5 px-3 py-2 cursor-pointer transition-colors">
                      <Plus className="w-4 h-4" /> Nova Proposta
                    </DialogTrigger>
                    <DialogContent className="bg-zinc-900 border border-zinc-800 text-white sm:max-w-[60vw] w-full overflow-y-auto max-h-[85vh]">
                      <DialogHeader>
                        <DialogTitle>Nova Proposta Comercial / Orçamento</DialogTitle>
                        <DialogDescription className="text-zinc-400">Preencha os dados abaixo. Você pode preencher de forma rápida a partir de um cliente ou lead existente.</DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleAddProposal} className="space-y-4 py-2">
                        
                        {/* Quick Autofill */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3 rounded-lg bg-zinc-950 border border-zinc-850">
                          <Label htmlFor="autofill-select" className="text-xs text-zinc-400 font-semibold shrink-0">Preenchimento Rápido (Cliente ou Lead)</Label>
                          <div className="flex-grow">
                            <Select value={selectedEntityId} onValueChange={handleSelectEntityForAutofill}>
                              <SelectTrigger id="autofill-select" className="bg-zinc-900 border-zinc-800 text-white text-xs h-9 w-full">
                                <SelectValue placeholder="Selecione um cliente/lead para preencher os dados..." />
                              </SelectTrigger>
                            <SelectContent className="bg-zinc-900 border border-zinc-800 text-white">
                              <SelectItem value="none">-- Nenhum (Preencher Manualmente) --</SelectItem>
                              
                              <div className="px-2 py-1.5 text-[10px] font-bold text-zinc-500 uppercase">Clientes Ativos</div>
                              {clients.map(c => (
                                <SelectItem key={c.id} value={c.id}>{c.name} (Cliente)</SelectItem>
                              ))}

                              <div className="px-2 py-1.5 text-[10px] font-bold text-zinc-500 uppercase mt-2">Leads CRM</div>
                              {leads.map(l => (
                                <SelectItem key={l.id} value={l.id}>{l.name} - {l.company} (Lead)</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                        {/* Proposal metadata */}
                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="prop-num" className="text-zinc-300 text-xs">Nº do Orçamento *</Label>
                            <Input 
                              id="prop-num" 
                              value={newProposal.proposalNumber}
                              onChange={e => setNewProposal({...newProposal, proposalNumber: e.target.value})}
                              className="bg-zinc-950 border-zinc-800 text-white text-xs h-9" 
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="prop-date" className="text-zinc-300 text-xs">Data da Proposta *</Label>
                            <Input 
                              id="prop-date" 
                              type="date"
                              value={newProposal.date}
                              onChange={e => setNewProposal({...newProposal, date: e.target.value})}
                              className="bg-zinc-950 border-zinc-800 text-white text-xs h-9" 
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="prop-val" className="text-zinc-300 text-xs">Validade *</Label>
                            <Input 
                              id="prop-val" 
                              type="date"
                              value={newProposal.validityDate}
                              onChange={e => setNewProposal({...newProposal, validityDate: e.target.value})}
                              className="bg-zinc-950 border-zinc-800 text-white text-xs h-9" 
                              required
                            />
                          </div>
                        </div>

                        {/* Client details */}
                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="prop-client" className="text-zinc-300 text-xs">Nome do Cliente *</Label>
                            <Input 
                              id="prop-client" 
                              placeholder="Ex: Priscila Queiroz"
                              value={newProposal.clientName}
                              onChange={e => setNewProposal({...newProposal, clientName: e.target.value})}
                              className="bg-zinc-950 border-zinc-800 text-white text-xs h-9" 
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="prop-phone" className="text-zinc-300 text-xs">Telefone do Cliente</Label>
                            <Input 
                              id="prop-phone" 
                              placeholder="Ex: (11) 99999-9999"
                              value={newProposal.clientPhone}
                              onChange={e => setNewProposal({...newProposal, clientPhone: e.target.value})}
                              className="bg-zinc-950 border-zinc-800 text-white text-xs h-9" 
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="prop-email" className="text-zinc-300 text-xs">E-mail do Cliente</Label>
                            <Input 
                              id="prop-email" 
                              type="email"
                              placeholder="Ex: cliente@email.com"
                              value={newProposal.clientEmail}
                              onChange={e => setNewProposal({...newProposal, clientEmail: e.target.value})}
                              className="bg-zinc-950 border-zinc-800 text-white text-xs h-9" 
                            />
                          </div>
                        </div>

                        {/* Items Section */}
                        <div className="space-y-2 pt-2 border-t border-zinc-800">
                          <div className="flex justify-between items-center">
                            <Label className="text-zinc-300 font-semibold text-xs">Itens / Serviços da Proposta *</Label>
                            <Button 
                              type="button" 
                              onClick={() => setProposalItems([...proposalItems, { name: '', quantity: 1, price: 0 }])}
                              variant="outline" 
                              size="sm"
                              className="h-7 text-[10px] border-zinc-800 hover:bg-zinc-800 text-zinc-300 cursor-pointer"
                            >
                              + Adicionar Item
                            </Button>
                          </div>

                          <div className="space-y-2">
                            {proposalItems.map((item, idx) => (
                              <div key={idx} className="flex gap-2 items-center flex-wrap sm:flex-nowrap">
                                <span className="text-[10px] text-zinc-500 font-mono w-4 text-center shrink-0">{idx + 1}</span>
                                
                                {/* Service Preset Select */}
                                <Select 
                                  value={availableServices.includes(item.name) ? item.name : 'custom'} 
                                  onValueChange={val => {
                                    if (val && val !== 'custom') {
                                      const updated = [...proposalItems];
                                      updated[idx].name = val;
                                      setProposalItems(updated);
                                    }
                                  }}
                                >
                                  <SelectTrigger className="bg-zinc-950 border-zinc-800 text-white text-xs h-9 w-36 shrink-0">
                                    <SelectValue placeholder="Serviço..." />
                                  </SelectTrigger>
                                  <SelectContent className="bg-zinc-900 border border-zinc-800 text-white">
                                    <SelectItem value="custom">Outro (Manual)</SelectItem>
                                    {availableServices.map(svc => (
                                      <SelectItem key={svc} value={svc}>{svc}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>

                                {/* Service Description Input (Manual / Edited) */}
                                <Input 
                                  placeholder="Descrição do serviço..."
                                  value={item.name}
                                  onChange={e => {
                                    const updated = [...proposalItems];
                                    updated[idx].name = e.target.value;
                                    setProposalItems(updated);
                                  }}
                                  className="bg-zinc-950 border-zinc-800 text-white text-xs h-9 flex-1 min-w-[120px]" 
                                  required
                                />

                                {/* Collaborator Selection Dropdown */}
                                <Select 
                                  value={item.collaboratorId || 'none'} 
                                  onValueChange={val => {
                                    const updated = [...proposalItems];
                                    updated[idx].collaboratorId = (val === 'none' || !val) ? undefined : val;
                                    setProposalItems(updated);
                                  }}
                                >
                                  <SelectTrigger className="bg-zinc-950 border-zinc-800 text-white text-xs h-9 w-36 shrink-0">
                                    <SelectValue placeholder="Colaborador" />
                                  </SelectTrigger>
                                  <SelectContent className="bg-zinc-900 border border-zinc-800 text-white">
                                    <SelectItem value="none">Sem Colaborador</SelectItem>
                                    {collaborators.map(col => (
                                      <SelectItem key={col.id} value={col.id}>
                                        {col.name} ({col.company.toUpperCase()})
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>

                                <Input 
                                  type="number"
                                  placeholder="Qtd."
                                  value={item.quantity}
                                  onChange={e => {
                                    const updated = [...proposalItems];
                                    updated[idx].quantity = Math.max(1, parseInt(e.target.value) || 1);
                                    setProposalItems(updated);
                                  }}
                                  className="bg-zinc-950 border-zinc-800 text-white text-xs h-9 w-14 text-center shrink-0" 
                                  min="1"
                                  required
                                />
                                <Input 
                                  type="number"
                                  placeholder="Preço (R$)"
                                  value={item.price || ''}
                                  onChange={e => {
                                    const updated = [...proposalItems];
                                    updated[idx].price = Math.max(0, parseFloat(e.target.value) || 0);
                                    setProposalItems(updated);
                                  }}
                                  className="bg-zinc-950 border-zinc-800 text-white text-xs h-9 w-24 text-right shrink-0" 
                                  min="0"
                                  step="0.01"
                                  required
                                />
                                {proposalItems.length > 1 && (
                                  <Button 
                                    type="button" 
                                    onClick={() => setProposalItems(proposalItems.filter((_, i) => i !== idx))}
                                    variant="outline" 
                                    size="sm"
                                    className="h-9 w-9 p-0 border-red-955 text-red-400 hover:bg-red-955/20 cursor-pointer"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </Button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Totals Calculation */}
                        <div className="grid grid-cols-3 gap-4 pt-2 border-t border-zinc-800">
                          <div className="space-y-1">
                            <span className="text-[10px] text-zinc-400">Subtotal:</span>
                            <div className="text-sm font-semibold text-white">
                              {proposalItems.reduce((acc, item) => acc + (item.quantity * item.price), 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="prop-discount" className="text-zinc-300 text-xs">Desconto (R$)</Label>
                            <Input 
                              id="prop-discount" 
                              type="number"
                              placeholder="0.00"
                              value={(newProposal as any).discount || ''}
                              onChange={e => {
                                const val = e.target.value;
                                setNewProposal({...newProposal, discount: val} as any);
                                // Automatically update the Discount text inside observations if it's there
                                const descNum = parseFloat(val) || 0;
                                const descStr = descNum.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
                                setNewProposal(prev => {
                                  let obs = prev.observations;
                                  if (obs.includes('Desconto: R$')) {
                                    obs = obs.replace(/Desconto:\s*R?\s*[0-9.,]+/i, `Desconto: R$ ${descStr}`);
                                  } else {
                                    obs = obs.replace(/Desconto:[^\n]*/i, `Desconto: R$ ${descStr}`);
                                  }
                                  return { ...prev, observations: obs, discount: val } as any;
                                });
                              }}
                              className="bg-zinc-950 border-zinc-800 text-white text-xs h-9 text-right" 
                            />
                          </div>
                          <div className="space-y-1 text-right">
                            <span className="text-[10px] text-zinc-400">Total Final:</span>
                            <div className="text-base font-bold text-emerald-400">
                              {Math.max(0, proposalItems.reduce((acc, item) => acc + (item.quantity * item.price), 0) - (parseFloat((newProposal as any).discount) || 0)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </div>
                          </div>
                        </div>

                        {/* Observations / Terms */}
                        <div className="space-y-2">
                          <Label htmlFor="prop-obs" className="text-zinc-300 text-xs font-semibold">Observações / Termos *</Label>
                          <textarea
                            id="prop-obs" 
                            value={newProposal.observations}
                            onChange={e => setNewProposal({...newProposal, observations: e.target.value})}
                            className="bg-zinc-950 border border-zinc-800 text-white text-xs p-2.5 rounded-md w-full h-32 font-sans focus:outline-none focus:ring-1 focus:ring-zinc-700"
                            placeholder="Condições de pagamento, prazos de entrega e validade..."
                            required
                          />
                        </div>

                        <DialogFooter className="mt-6">
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => setIsProposalDialogOpen(false)}
                            className="border-zinc-800 hover:bg-zinc-800 text-zinc-300 text-xs"
                          >
                            Cancelar
                          </Button>
                          <Button type="submit" className="bg-zinc-100 hover:bg-zinc-200 text-zinc-950 text-xs font-semibold">
                            Salvar Proposta
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>

                {/* Proposals table */}
                {proposals.length === 0 ? (
                  <Card className="bg-[#1e1e24]/40 border-zinc-800/80 p-12 text-center flex flex-col items-center justify-center gap-3">
                    <FileText className="w-10 h-10 text-zinc-700" />
                    <div>
                      <p className="text-xs font-semibold text-zinc-450">Nenhuma proposta criada ainda</p>
                      <p className="text-[10px] text-zinc-500 mt-1">Crie sua primeira proposta clicando no botão "Nova Proposta".</p>
                    </div>
                  </Card>
                ) : (
                  <div className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-900/40">
                    <Table>
                      <TableHeader className="bg-zinc-900/50">
                        <TableRow className="border-b border-zinc-800">
                          <TableHead className="text-zinc-400 font-semibold text-xs">Orçamento</TableHead>
                          <TableHead className="text-zinc-400 font-semibold text-xs">Cliente</TableHead>
                          <TableHead className="text-zinc-400 font-semibold text-xs">Data</TableHead>
                          <TableHead className="text-zinc-400 font-semibold text-xs">Validade</TableHead>
                          <TableHead className="text-zinc-400 font-semibold text-right text-xs">Total</TableHead>
                          <TableHead className="text-zinc-400 font-semibold text-center text-xs w-28">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {proposals.map((prop) => (
                          <TableRow key={prop.id} className="border-b border-zinc-800/60 hover:bg-zinc-900/20">
                            <TableCell className="font-semibold text-white text-xs">#{prop.proposalNumber}</TableCell>
                            <TableCell className="font-medium text-white text-xs">
                              <div>{prop.clientName}</div>
                              <div className="text-[10px] text-zinc-500">{prop.clientEmail || prop.clientPhone}</div>
                            </TableCell>
                            <TableCell className="text-zinc-400 text-xs">
                              {prop.date.split('-').reverse().join('/')}
                            </TableCell>
                            <TableCell className="text-zinc-400 text-xs">
                              {prop.validityDate.split('-').reverse().join('/')}
                            </TableCell>
                            <TableCell className="text-right font-bold text-emerald-400 text-xs">
                              {prop.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <Button
                                  onClick={() => handleExportProposalPDF(prop)}
                                  title="Exportar PDF / Imprimir"
                                  variant="outline"
                                  size="sm"
                                  className="h-8 w-8 p-0 border-zinc-800 hover:bg-zinc-800 text-zinc-300 cursor-pointer"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                </Button>
                                <Button
                                  onClick={() => handleEditProposalTrigger(prop)}
                                  title="Editar Orçamento"
                                  variant="outline"
                                  size="sm"
                                  className="h-8 w-8 p-0 border-zinc-800 hover:bg-zinc-800 text-zinc-300 cursor-pointer"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </Button>
                                <Button
                                  onClick={() => handleDeleteProposal(prop.id)}
                                  title="Excluir Proposta"
                                  variant="outline"
                                  size="sm"
                                  className="h-8 w-8 p-0 border-red-950 text-red-400 hover:bg-red-950/20 cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* --- COLABORADORES MODULE --- */}
        {activeTab === 'colaboradores' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-white">Equipe & Colaboradores</h2>
                <p className="text-sm text-zinc-400">Gerenciamento dos profissionais parceiros e internos da agência.</p>
              </div>

              {/* Add Collaborator Dialog */}
              <Dialog open={isCollaboratorDialogOpen} onOpenChange={setIsCollaboratorDialogOpen}>
                <DialogTrigger className="inline-flex items-center justify-center rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-950 text-xs font-semibold gap-1.5 px-3 py-2 cursor-pointer transition-colors">
                  <Plus className="w-4 h-4" /> Novo Colaborador
                </DialogTrigger>
                <DialogContent className="bg-zinc-900 border border-zinc-800 text-white">
                  <DialogHeader>
                    <DialogTitle>Cadastrar Novo Colaborador</DialogTitle>
                    <DialogDescription className="text-zinc-400">Insira as informações do novo integrante ou agência parceira.</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddCollaborator} className="space-y-4 py-2">
                    <div className="space-y-2">
                      <Label htmlFor="col-name" className="text-zinc-300">Nome Completo *</Label>
                      <Input 
                        id="col-name" 
                        placeholder="Ex: Lucas Santos"
                        value={newCollaborator.name} 
                        onChange={e => setNewCollaborator({...newCollaborator, name: e.target.value})} 
                        className="bg-zinc-950 border-zinc-800 text-white" 
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="col-role" className="text-zinc-300">Função *</Label>
                        <Select 
                          value={newCollaborator.role} 
                          onValueChange={val => setNewCollaborator({...newCollaborator, role: val || 'dev'})}
                        >
                          <SelectTrigger className="bg-zinc-950 border-zinc-800 text-white">
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent className="bg-zinc-900 border border-zinc-800 text-white">
                            <SelectItem value="dev">Desenvolvedor (dev)</SelectItem>
                            <SelectItem value="mkt">Marketing (mkt)</SelectItem>
                            <SelectItem value="design">Designer (design)</SelectItem>
                            <SelectItem value="social">Social Media (social)</SelectItem>
                            <SelectItem value="atendimento">Atendimento (atendimento)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="col-company" className="text-zinc-300">Empresa *</Label>
                        <Select 
                          value={newCollaborator.company} 
                          onValueChange={val => setNewCollaborator({...newCollaborator, company: val || 'achei'})}
                        >
                          <SelectTrigger className="bg-zinc-950 border-zinc-800 text-white">
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent className="bg-zinc-900 border border-zinc-800 text-white">
                            <SelectItem value="achei">Dálete Achei (achei)</SelectItem>
                            <SelectItem value="mid">MID (mid)</SelectItem>
                            <SelectItem value="brit">BRIT (brit)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="col-email" className="text-zinc-300">E-mail</Label>
                        <Input 
                          id="col-email" 
                          type="email"
                          placeholder="Ex: lucas@achei.com"
                          value={newCollaborator.email} 
                          onChange={e => setNewCollaborator({...newCollaborator, email: e.target.value})} 
                          className="bg-zinc-950 border-zinc-800 text-white" 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="col-phone" className="text-zinc-300">Telefone</Label>
                        <Input 
                          id="col-phone" 
                          placeholder="Ex: (11) 99999-8888"
                          value={newCollaborator.phone} 
                          onChange={e => setNewCollaborator({...newCollaborator, phone: e.target.value})} 
                          className="bg-zinc-950 border-zinc-800 text-white" 
                        />
                      </div>
                    </div>

                    <DialogFooter className="mt-6">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsCollaboratorDialogOpen(false)}
                        className="border-zinc-800 hover:bg-zinc-800 text-zinc-300"
                      >
                        Cancelar
                      </Button>
                      <Button type="submit" className="bg-zinc-100 hover:bg-zinc-200 text-zinc-950">
                        Confirmar Cadastro
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Collaborators List Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {collaborators.map((col) => (
                <Card key={col.id} className="bg-[#1e1e24] border-zinc-800/80 hover:border-zinc-700/60 transition flex flex-col justify-between">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-base font-bold text-white">{col.name}</CardTitle>
                        <CardDescription className="text-xs text-zinc-500 mt-0.5">Empresa: <span className="font-semibold text-zinc-300 uppercase">{col.company}</span></CardDescription>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        col.role === 'dev' ? 'bg-blue-950 text-blue-400' :
                        col.role === 'mkt' ? 'bg-purple-950 text-purple-400' :
                        col.role === 'design' ? 'bg-emerald-950 text-emerald-400' : 'bg-zinc-800 text-zinc-300'
                      }`}>
                        {col.role}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-xs space-y-1 text-zinc-400">
                      {col.email && <div><span className="text-zinc-500 font-semibold">Email:</span> {col.email}</div>}
                      {col.phone && <div><span className="text-zinc-500 font-semibold">Tel:</span> {col.phone}</div>}
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800/60">
                      <Button
                        onClick={() => handleDeleteCollaborator(col.id)}
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs border-red-955 text-red-400 hover:bg-red-955/20 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1" /> Remover
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* --- 5. REPORTS MODULE --- */}
        {activeTab === 'relatorios' && (
          <div className="space-y-6">
            {selectedReportClientId === '' ? (
              <div className="flex flex-col items-center justify-center min-h-[400px] border border-zinc-800 rounded-2xl bg-zinc-900/20 p-8 max-w-lg mx-auto text-center space-y-6">
                <div className="p-4 bg-zinc-850 rounded-2xl border border-zinc-800">
                  <Users className="w-10 h-10 text-zinc-400" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-white">Visualizar Relatórios por Cliente</h3>
                  <p className="text-xs text-zinc-400">Por favor, selecione um cliente da lista abaixo para visualizar sua fila de espera e relatórios aprovados.</p>
                </div>
                
                <div className="w-full space-y-2 text-left">
                  <Label className="text-zinc-400 text-xs font-semibold">Selecione o Cliente</Label>
                  <Select value={selectedReportClientId} onValueChange={val => setSelectedReportClientId(val || '')}>
                    <SelectTrigger className="bg-zinc-950 border-zinc-800 text-white w-full">
                      <SelectValue placeholder="Escolha um cliente..." />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border border-zinc-800 text-white">
                      {clients.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <a
                  href="/enviar-relatorio"
                  target="_blank"
                  className="text-xs text-zinc-450 hover:text-zinc-300 underline transition"
                >
                  Abrir formulário de envio externo &rarr;
                </a>
              </div>
            ) : (
              <>
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-4 border-b border-zinc-800">
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                      Relatórios: <span className="text-zinc-450 font-medium">{clients.find(c => c.id === selectedReportClientId)?.name}</span>
                    </h2>
                    <p className="text-sm text-zinc-400">Gerencie a fila de espera de relatórios e exporte dados aprovados para este cliente.</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setSelectedReportClientId('')}
                      variant="outline"
                      className="border-zinc-800 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold cursor-pointer"
                    >
                      Selecionar Outro Cliente
                    </Button>
                    <a
                      href="/enviar-relatorio"
                      target="_blank"
                      className="inline-flex items-center justify-center rounded-md bg-zinc-850 hover:bg-zinc-800 text-white text-xs font-semibold gap-1.5 px-3 py-2 cursor-pointer transition-colors border border-zinc-800"
                    >
                      Abrir Formulário Externo &rarr;
                    </a>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  
                  {/* Left Column: Waiting list (Aprovações Pendentes) */}
                  <div className="lg:col-span-5 space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                      <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                        <Inbox className="w-4 h-4 text-yellow-500" /> Fila de Espera (Cliente)
                      </h3>
                      <span className="bg-yellow-950 text-yellow-400 px-2 py-0.5 rounded text-[10px] font-mono font-bold">
                        {submissions.filter(s => s.status === 'pending' && s.clientId === selectedReportClientId).length} PENDENTES
                      </span>
                    </div>

                    {submissions.filter(s => s.status === 'pending' && s.clientId === selectedReportClientId).length === 0 ? (
                      <Card className="bg-[#1e1e24]/40 border-zinc-800/80 p-8 text-center flex flex-col items-center justify-center gap-3">
                        <CheckCircle className="w-8 h-8 text-zinc-600" />
                        <p className="text-xs text-zinc-400">Nenhum relatório na fila de espera para este cliente.</p>
                      </Card>
                    ) : (
                      <div className="space-y-3">
                        {submissions
                          .filter(s => s.status === 'pending' && s.clientId === selectedReportClientId)
                          .map((sub) => (
                            <Card key={sub.id} className="bg-[#1e1e24] border-zinc-800/80 hover:border-zinc-700 transition">
                              <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <CardTitle className="text-sm font-semibold text-white">{sub.clientName}</CardTitle>
                                    <p className="text-[10px] text-zinc-500 mt-0.5">Ref: {sub.month} | Enviado em {new Date(sub.submittedAt).toLocaleDateString('pt-BR')}</p>
                                  </div>
                                </div>
                              </CardHeader>
                              <CardContent className="space-y-3 text-xs">
                                
                                <div className="space-y-1.5 bg-zinc-950/40 p-2.5 rounded-lg border border-zinc-850/60">
                                  <p className="text-[9px] font-bold text-yellow-500 uppercase tracking-wider">1. Validação do Lead</p>
                                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-zinc-400">
                                    <div><span className="text-zinc-500">Contato:</span> {new Date(sub.leadContactDate).toLocaleDateString('pt-BR')}</div>
                                    <div><span className="text-zinc-500">Lead:</span> {sub.leadName}</div>
                                    <div><span className="text-zinc-500">Tel:</span> {sub.leadPhone}</div>
                                    <div><span className="text-zinc-500">Campanha:</span> {sub.leadCampaign}</div>
                                    <div className="col-span-2">
                                      <span className="text-zinc-500">Vendeu?</span>{' '}
                                      <span className={sub.leadSold === 'Sim' ? 'text-emerald-400 font-semibold' : sub.leadSold === 'Não' ? 'text-red-400 font-semibold' : 'text-yellow-500 font-semibold'}>
                                        {sub.leadSold}
                                      </span>
                                      {sub.leadSold === 'Não' && ` - ${sub.leadWhyNotSold}`}
                                    </div>
                                  </div>
                                </div>

                                <div className="space-y-1.5 bg-zinc-950/40 p-2.5 rounded-lg border border-zinc-850/60">
                                  <p className="text-[9px] font-bold text-blue-400 uppercase tracking-wider">2. Atualização de Dados</p>
                                  <div className="space-y-1 text-zinc-400">
                                    <div><span className="text-zinc-500">Melhor Campanha:</span> {sub.topGoogleCampaign}</div>
                                    <div><span className="text-zinc-500">Keywords Positivas:</span> {sub.topPositiveKeywords}</div>
                                    <div><span className="text-zinc-500">Keywords Negativas:</span> {sub.negativeKeywordsToUpdate}</div>
                                    {sub.salesTeamObservations && <div className="text-[10px] italic mt-1 pt-1 border-t border-zinc-800/40 text-zinc-500">" {sub.salesTeamObservations} "</div>}
                                  </div>
                                </div>

                                <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800/40">
                                  <Button
                                    onClick={() => handleDenySubmission(sub.id)}
                                    variant="outline"
                                    size="sm"
                                    className="border-red-900/30 text-red-400 hover:bg-red-950/20 text-[10px] h-8 cursor-pointer flex items-center gap-1"
                                  >
                                    <X className="w-3 h-3" /> Rejeitar
                                  </Button>
                                  <Button
                                    onClick={() => handleApproveSubmission(sub.id)}
                                    size="sm"
                                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] h-8 cursor-pointer flex items-center gap-1"
                                  >
                                    <Check className="w-3 h-3" /> Aprovar
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                      </div>
                    )}
                  </div>

                  {/* Right Column: Approved Reports (Cards de Respostas) */}
                  <div className="lg:col-span-7 space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                      <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-emerald-400" /> Relatórios Aprovados (Cliente)
                      </h3>
                      <span className="bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded text-[10px] font-mono font-bold">
                        {submissions.filter(s => s.status === 'approved' && s.clientId === selectedReportClientId).length} APROVADOS
                      </span>
                    </div>

                    {(() => {
                      const approvedList = submissions.filter(s => s.status === 'approved' && s.clientId === selectedReportClientId);
                      if (approvedList.length === 0) {
                        return (
                          <Card className="bg-[#1e1e24]/40 border-zinc-800/80 p-12 text-center flex flex-col items-center justify-center gap-3">
                            <FileText className="w-10 h-10 text-zinc-700" />
                            <div>
                              <p className="text-xs font-semibold text-zinc-400">Nenhum relatório implantado ainda</p>
                              <p className="text-[10px] text-zinc-500 mt-1">Aprove relatórios na fila para que apareçam aqui.</p>
                            </div>
                          </Card>
                        );
                      }

                      // Group by month
                      const groupedByMonth: { [key: string]: FormSubmission[] } = {};
                      approvedList.forEach(sub => {
                        if (!groupedByMonth[sub.month]) {
                          groupedByMonth[sub.month] = [];
                        }
                        groupedByMonth[sub.month].push(sub);
                      });

                      return (
                        <div className="space-y-8">
                          {Object.keys(groupedByMonth).map((monthName) => {
                            const monthSubmissions = groupedByMonth[monthName];
                            return (
                              <div key={monthName} className="space-y-3">
                                {/* Month Group Header (Clickable Folder Style) */}
                                <div 
                                  onClick={() => toggleMonthExpand(monthName)}
                                  className="flex items-center justify-between bg-zinc-900/60 p-3 rounded-lg border border-zinc-800 cursor-pointer hover:bg-zinc-900/90 transition select-none"
                                >
                                  <div className="flex items-center gap-2">
                                    {expandedMonths[monthName] ? (
                                      <ChevronDown className="w-4 h-4 text-zinc-400 shrink-0" />
                                    ) : (
                                      <ChevronRight className="w-4 h-4 text-zinc-400 shrink-0" />
                                    )}
                                    <div>
                                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">{monthName}</h4>
                                      <p className="text-[10px] text-zinc-500 mt-0.5">{monthSubmissions.length} atualizações nesta pasta</p>
                                    </div>
                                  </div>
                                  <Button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleExportMonthlyConsolidated(monthName, monthSubmissions);
                                    }}
                                    size="sm"
                                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] h-7 px-3 cursor-pointer flex items-center gap-1.5"
                                  >
                                    <Download className="w-3.5 h-3.5" /> Exportar Consolidação do Mês
                                  </Button>
                                </div>

                                {/* List of Cards for this Month (Shown only when expanded) */}
                                {expandedMonths[monthName] && (
                                  <div className="space-y-4 pl-2 border-l border-zinc-800/60 ml-2 animate-fadeIn">
                                    {monthSubmissions
                                      .sort((a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime())
                                      .map((sub, idx) => (
                                        <Card key={sub.id} className="bg-[#1e1e24] border-zinc-800/80 flex flex-col justify-between">
                                          <CardHeader className="pb-2">
                                            <div className="flex justify-between items-start">
                                              <div>
                                                <CardTitle className="text-sm font-semibold text-white">Atualização Semanal #{idx + 1}</CardTitle>
                                                <p className="text-[10px] text-zinc-400 mt-0.5">Enviado em {new Date(sub.submittedAt).toLocaleDateString('pt-BR')}</p>
                                              </div>
                                              <span className="text-[9px] bg-zinc-800 text-zinc-400 border border-zinc-700/50 px-1.5 py-0.5 rounded font-semibold">
                                                Semana {idx + 1}
                                              </span>
                                            </div>
                                          </CardHeader>
                                          <CardContent className="space-y-3.5 text-xs">
                                            
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                              <div className="space-y-1.5 bg-zinc-950/40 p-2.5 rounded-lg border border-zinc-850/60">
                                                <p className="text-[9px] font-bold text-yellow-500 uppercase tracking-wider">
                                                  {sub.leads && sub.leads.length > 1 ? `1. Validação dos Leads (${sub.leads.length})` : '1. Validação do Lead'}
                                                </p>
                                                <div className="space-y-3 mt-1.5">
                                                  {sub.leads && sub.leads.length > 0 ? (
                                                    sub.leads.map((l, leadIdx) => (
                                                      <div key={leadIdx} className="space-y-1 text-zinc-450 font-normal border-b border-zinc-900/65 pb-2 last:border-0 last:pb-0">
                                                        {sub.leads!.length > 1 && (
                                                          <div className="text-[9px] font-bold text-zinc-500 uppercase mb-0.5">Lead #{leadIdx + 1}</div>
                                                        )}
                                                        <div><span className="text-zinc-500 font-semibold">Contato:</span> {l.contactDate ? new Date(l.contactDate).toLocaleDateString('pt-BR') : 'N/A'}</div>
                                                        <div><span className="text-zinc-500 font-semibold">Lead:</span> {l.name} ({l.phone})</div>
                                                        <div><span className="text-zinc-500 font-semibold">Campanha:</span> {l.campaign}</div>
                                                        <div>
                                                          <span className="text-zinc-500 font-semibold">Vendeu?</span>{' '}
                                                          <span className={l.sold === 'Sim' ? 'text-emerald-400 font-semibold' : l.sold === 'Não' ? 'text-red-400 font-semibold' : 'text-yellow-500 font-semibold'}>
                                                            {l.sold}
                                                          </span>
                                                          {l.sold === 'Não' && ` (${l.whyNotSold})`}
                                                        </div>
                                                      </div>
                                                    ))
                                                  ) : (
                                                    <div className="space-y-1 text-zinc-450 font-normal">
                                                      <div><span className="text-zinc-500 font-semibold">Contato:</span> {new Date(sub.leadContactDate).toLocaleDateString('pt-BR')}</div>
                                                      <div><span className="text-zinc-500 font-semibold">Lead:</span> {sub.leadName} ({sub.leadPhone})</div>
                                                      <div><span className="text-zinc-500 font-semibold">Campanha:</span> {sub.leadCampaign}</div>
                                                      <div>
                                                        <span className="text-zinc-500 font-semibold">Vendeu?</span>{' '}
                                                        <span className={sub.leadSold === 'Sim' ? 'text-emerald-400 font-semibold' : sub.leadSold === 'Não' ? 'text-red-400 font-semibold' : 'text-yellow-500 font-semibold'}>
                                                          {sub.leadSold}
                                                        </span>
                                                        {sub.leadSold === 'Não' && ` (${sub.leadWhyNotSold})`}
                                                      </div>
                                                    </div>
                                                  )}
                                                </div>
                                              </div>

                                              <div className="space-y-1.5 bg-zinc-950/40 p-2.5 rounded-lg border border-zinc-850/60">
                                                <p className="text-[9px] font-bold text-blue-400 uppercase tracking-wider">2. Atualização de Dados</p>
                                                <div className="space-y-1 text-zinc-450 font-normal">
                                                  <div><span className="text-zinc-500 font-semibold">Campanha Google:</span> {sub.topGoogleCampaign}</div>
                                                  <div><span className="text-zinc-500 font-semibold">Keywords (+):</span> {sub.topPositiveKeywords}</div>
                                                  <div><span className="text-zinc-500 font-semibold">Keywords (-):</span> {sub.negativeKeywordsToUpdate}</div>
                                                </div>
                                              </div>
                                            </div>

                                            {/* Google Ads Comparison block */}
                                            {(() => {
                                              const sortedForClient = [...submissions]
                                                .filter(s => s.status === 'approved' && s.clientId === sub.clientId)
                                                .sort((a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime());
                                              
                                              const currentIdx = sortedForClient.findIndex(item => item.id === sub.id);
                                              const firstSub = sortedForClient[0];
                                              
                                              if (currentIdx > 0 && firstSub) {
                                                const clientObj = clients.find(c => c.id === sub.clientId);
                                                const seed = clientObj ? clientObj.name.length : 10;
                                                
                                                const firstWeeklyInvestment = Math.round(sub.leadCampaign.length * 120 + seed * 100);
                                                const firstWeeklyClicks = Math.round(firstWeeklyInvestment / (seed * 0.08 + 1.2));
                                                const firstConversions = Math.round(firstWeeklyClicks * 0.10);
                                                const firstCpa = Number((firstWeeklyInvestment / (firstConversions || 1)).toFixed(2));

                                                const factor = 1 + (currentIdx * 0.08); 
                                                const currentWeeklyInvestment = Math.round(firstWeeklyInvestment * factor);
                                                const currentWeeklyClicks = Math.round(firstWeeklyClicks * (factor + 0.03));
                                                const currentConversions = Math.round(currentWeeklyClicks * 0.11);
                                                const currentCpa = Number((currentWeeklyInvestment / (currentConversions || 1)).toFixed(2));
                                                const currentImpressions = Math.round(currentWeeklyClicks * (seed * 10 + 200));

                                                const investmentDiff = currentWeeklyInvestment - firstWeeklyInvestment;
                                                const conversionDiff = currentConversions - firstConversions;
                                                const cpaDiff = currentCpa - firstCpa;

                                                return (
                                                  <Card className="bg-[#1e1e24] border-zinc-800/80 mt-4 overflow-hidden">
                                                    <CardHeader className="pb-3 bg-zinc-900/30 border-b border-zinc-805/30">
                                                      <div className="flex justify-between items-center">
                                                        <div>
                                                          <CardTitle className="text-[11px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                                                            <TrendingUp className="w-3.5 h-3.5 text-blue-400" /> Comparativo Google Ads (Vs. 1ª Semana)
                                                          </CardTitle>
                                                          <CardDescription className="text-[9px] text-zinc-500 mt-0.5">Métricas de performance comparativas semanais</CardDescription>
                                                        </div>
                                                        <span className="text-[9px] bg-blue-950 text-blue-400 border border-blue-900/50 px-2 py-0.5 rounded font-semibold uppercase">
                                                          Google Ads
                                                        </span>
                                                      </div>
                                                    </CardHeader>
                                                    <CardContent className="p-3.5 space-y-3.5">
                                                      <div className="grid grid-cols-2 gap-4 pb-3 border-b border-zinc-800/40">
                                                        <div>
                                                          <p className="text-[9px] uppercase font-bold text-zinc-500">Impressões</p>
                                                          <p className="text-xs font-bold text-white mt-0.5">{currentImpressions.toLocaleString('pt-BR')}</p>
                                                        </div>
                                                        <div>
                                                          <p className="text-[9px] uppercase font-bold text-zinc-500">Cliques</p>
                                                          <p className="text-xs font-bold text-white mt-0.5">{currentWeeklyClicks.toLocaleString('pt-BR')}</p>
                                                        </div>
                                                      </div>

                                                      <div className="grid grid-cols-2 gap-4 pb-3 border-b border-zinc-800/40">
                                                        <div>
                                                          <p className="text-[9px] uppercase font-bold text-zinc-500">CPC Médio</p>
                                                          <p className="text-xs font-bold text-white mt-0.5">
                                                            {(currentWeeklyInvestment / (currentWeeklyClicks || 1)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                                          </p>
                                                        </div>
                                                        <div>
                                                          <p className="text-[9px] uppercase font-bold text-zinc-500">Conversões</p>
                                                          <div className="flex items-baseline gap-1.5 mt-0.5">
                                                            <span className="text-xs font-bold text-white">{currentConversions}</span>
                                                            <span className={`text-[9px] font-semibold ${conversionDiff >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                                              ({conversionDiff >= 0 ? '+' : ''}{conversionDiff})
                                                            </span>
                                                          </div>
                                                        </div>
                                                      </div>

                                                      <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                          <p className="text-[9px] uppercase font-bold text-zinc-500">Cálculo CPA</p>
                                                          <div className="flex items-baseline gap-1.5 mt-0.5">
                                                            <span className="text-xs font-bold text-emerald-450">
                                                              {currentCpa.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                                            </span>
                                                            <span className={`text-[9px] font-semibold ${cpaDiff <= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                                              ({cpaDiff >= 0 ? '+' : ''}{cpaDiff.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })})
                                                            </span>
                                                          </div>
                                                        </div>
                                                        <div>
                                                          <p className="text-[9px] uppercase font-bold text-zinc-500">Investimento Semanal</p>
                                                          <div className="flex items-baseline gap-1.5 mt-0.5">
                                                            <span className="text-xs font-bold text-white">
                                                              {currentWeeklyInvestment.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                                            </span>
                                                            <span className={`text-[9px] font-semibold ${investmentDiff >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                                              ({investmentDiff >= 0 ? '+' : ''}{investmentDiff.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })})
                                                            </span>
                                                          </div>
                                                        </div>
                                                      </div>
                                                    </CardContent>
                                                  </Card>
                                                );
                                              } else {
                                                return (
                                                  <Card className="bg-[#1e1e24] border-zinc-800/80 mt-4 p-4 text-center text-zinc-550 text-[10px] italic">
                                                    Esta é a 1ª atualização registrada do cliente. As atualizações posteriores exibirão o comparativo de Google Ads contra esta baseline.
                                                  </Card>
                                                );
                                              }
                                            })()}

                                            {sub.salesTeamObservations && (
                                              <div className="text-[11px] italic bg-zinc-950/30 p-2.5 rounded-lg border border-zinc-850 text-zinc-500">
                                                <span className="font-semibold text-zinc-400 not-italic block mb-0.5">Obs. Comercial:</span>
                                                "{sub.salesTeamObservations}"
                                              </div>
                                            )}
                                            
                                            <div className="pt-3 border-t border-zinc-800/40 flex items-center justify-between">
                                              <span className="text-[9px] text-zinc-500 font-medium">
                                                Submetido às {new Date(sub.submittedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                              </span>
                                              <Button
                                                onClick={() => handleExportSubmission(sub)}
                                                size="sm"
                                                className="bg-zinc-800 hover:bg-zinc-750 text-white text-[10px] h-7 px-2.5 cursor-pointer flex items-center gap-1 border border-zinc-700/50"
                                              >
                                                <Download className="w-3 h-3 text-zinc-400" /> Exportar Semana
                                              </Button>
                                            </div>
                                          </CardContent>
                                        </Card>
                                      ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>

                </div>
              </>
            )}
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

            {/* Controls Bar for Date & Refresh */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-zinc-905/60 border border-zinc-800/80 rounded-xl">
              <div className="flex items-center gap-3">
                <span className="text-xs text-zinc-400 font-medium">Ocorrência de Atualização Padrão:</span>
                <select 
                  value={comparisonPeriod}
                  onChange={(e) => setComparisonPeriod(e.target.value as any)}
                  className="bg-zinc-950 border border-zinc-800 text-xs text-white rounded px-2.5 py-1.5 focus:outline-none focus:border-zinc-700 transition cursor-pointer"
                >
                  <option value="agora">Agora</option>
                  <option value="7">7 dias atrás</option>
                  <option value="14">14 dias atrás</option>
                  <option value="21">21 dias atrás</option>
                  <option value="30">1 mês atrás</option>
                </select>
              </div>
              <div className="flex items-center gap-3">
                <Button 
                  onClick={handleRefreshAds} 
                  disabled={isRefreshingAds}
                  className="bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 text-white text-xs font-semibold gap-1.5 cursor-pointer h-8"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingAds ? 'animate-spin' : ''}`} />
                  {isRefreshingAds ? 'Sincronizando...' : 'Sincronizar Agora'}
                </Button>
                <div className="text-[10px] text-zinc-550 italic">
                  Intervalo ativo: {comparisonPeriod === 'agora' ? 'Agora' : (comparisonPeriod === '30' ? '1 mês' : `${comparisonPeriod} dias`)}
                </div>
              </div>
            </div>

            {/* Google Ads client performance metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {clients
                .filter(c => c.status === 'Ativo')
                .map((client) => {
                  const selectedMonth = selectedAdsMonths[client.id] || "Junho de 2026";
                  
                  // Compute month multiplier/factor for base calculations
                  const monthsList = ["Julho de 2026", "Junho de 2026", "Maio de 2026", "Abril de 2026", "Março de 2026"];
                  const monthIndex = monthsList.indexOf(selectedMonth);
                  const monthFactor = 1 - (monthIndex * 0.06);

                  // Generate deterministically mock metrics based on client id/name, unless overridden manually
                  const seed = client.name.length;
                  const custom = manualAdsData[client.id]?.[selectedMonth];
                  
                  const impressions = custom ? custom.impressions : Math.round((seed * 45000 + 10000) * adsRandomMultiplier * monthFactor);
                  const clicks = custom ? custom.clicks : Math.round(impressions * (seed * 0.008 + 0.02));
                  const investment = custom ? custom.investment : Math.round(client.contractValue * 0.6 * adsRandomMultiplier * monthFactor); // Weekly investment
                  const cpc = Number((investment / (clicks || 1)).toFixed(2));
                  const conversions = custom ? custom.conversions : Math.round(clicks * 0.12);
                  const cpa = Number((investment / (conversions || 1)).toFixed(2));

                  // Simple comparison based on selected period
                  let periodFactor = 0.92;
                  let periodLabel = '7d';
                  if (comparisonPeriod === 'agora') {
                    periodFactor = 1.00;
                    periodLabel = 'Agora';
                  } else if (comparisonPeriod === '14') {
                    periodFactor = 0.85;
                    periodLabel = '14d';
                  } else if (comparisonPeriod === '21') {
                    periodFactor = 0.78;
                    periodLabel = '21d';
                  } else if (comparisonPeriod === '30') {
                    periodFactor = 0.70;
                    periodLabel = '1m';
                  }

                  const prevImpressions = Math.round(impressions * (periodFactor + (seed % 5) * 0.02) * (1 / adsRandomMultiplier));
                  const prevClicks = Math.round(clicks * (periodFactor - 0.02 + (seed % 4) * 0.03) * (1 / adsRandomMultiplier));
                  const prevInvestment = Math.round(investment * (periodFactor + 0.03 + (seed % 3) * 0.02) * (1 / adsRandomMultiplier));
                  const prevCpc = Number((prevInvestment / (prevClicks || 1)).toFixed(2));
                  const prevConversions = Math.round(conversions * (periodFactor - 0.04 + (seed % 6) * 0.02) * (1 / adsRandomMultiplier));
                  const prevCpa = Number((prevInvestment / (prevConversions || 1)).toFixed(2));

                  const diffImpressions = impressions - prevImpressions;
                  const diffClicks = clicks - prevClicks;
                  const diffConversions = conversions - prevConversions;
                  const diffCpc = cpc - prevCpc;
                  const diffCpa = cpa - prevCpa;
                  const diffInvestment = investment - prevInvestment;

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

                        {/* Monthly dropdown selector inside card */}
                        <div className="mt-3 flex items-center gap-2 bg-zinc-950/40 p-1.5 rounded-lg border border-zinc-850">
                          <span className="text-[9px] text-zinc-550 font-bold uppercase pl-1 tracking-wider">Mês:</span>
                          <select 
                            value={selectedMonth}
                            onChange={(e) => setSelectedAdsMonths(prev => ({ ...prev, [client.id]: e.target.value }))}
                            className="bg-transparent text-white border-none outline-none text-[10px] font-semibold cursor-pointer flex-1"
                          >
                            <option value="Julho de 2026" className="bg-zinc-900">Julho de 2026</option>
                            <option value="Junho de 2026" className="bg-zinc-900">Junho de 2026</option>
                            <option value="Maio de 2026" className="bg-zinc-900">Maio de 2026</option>
                            <option value="Abril de 2026" className="bg-zinc-900">Abril de 2026</option>
                            <option value="Março de 2026" className="bg-zinc-900">Março de 2026</option>
                          </select>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3.5">
                        {/* Metric lines */}
                        <div className="grid grid-cols-2 gap-4 pb-3 border-b border-zinc-800/40">
                          <div>
                            <p className="text-[10px] uppercase font-bold text-zinc-500">Impressões</p>
                            <p className="text-sm font-bold text-white mt-0.5">{impressions.toLocaleString('pt-BR')}</p>
                            <p className={`text-[10px] mt-0.5 font-medium ${diffImpressions >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                              {diffImpressions >= 0 ? '▲' : '▼'} {Math.abs(diffImpressions).toLocaleString('pt-BR')} ({periodLabel})
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase font-bold text-zinc-500">Cliques</p>
                            <p className="text-sm font-bold text-white mt-0.5">{clicks.toLocaleString('pt-BR')}</p>
                            <p className={`text-[10px] mt-0.5 font-medium ${diffClicks >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                              {diffClicks >= 0 ? '▲' : '▼'} {Math.abs(diffClicks).toLocaleString('pt-BR')} ({periodLabel})
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pb-3 border-b border-zinc-800/40">
                          <div>
                            <p className="text-[10px] uppercase font-bold text-zinc-500">CPC Médio</p>
                            <p className="text-sm font-bold text-white mt-0.5">
                              {cpc.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </p>
                            <p className={`text-[10px] mt-0.5 font-medium ${diffCpc <= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                              {diffCpc <= 0 ? '▼' : '▲'} {Math.abs(diffCpc).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} ({periodLabel})
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase font-bold text-zinc-500">Conversões</p>
                            <p className="text-sm font-bold text-white mt-0.5">{conversions.toLocaleString('pt-BR')}</p>
                            <p className={`text-[10px] mt-0.5 font-medium ${diffConversions >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                              {diffConversions >= 0 ? '▲' : '▼'} {Math.abs(diffConversions).toLocaleString('pt-BR')} ({periodLabel})
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-[10px] uppercase font-bold text-zinc-500">Cálculo CPA</p>
                            <p className="text-sm font-bold text-emerald-400 mt-0.5">
                              {cpa.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </p>
                            <p className={`text-[10px] mt-0.5 font-medium ${diffCpa <= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                              {diffCpa <= 0 ? '▼' : '▲'} {Math.abs(diffCpa).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} ({periodLabel})
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase font-bold text-zinc-500">Investimento Semanal</p>
                            <p className="text-sm font-bold text-white mt-0.5">
                              {investment.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </p>
                            <p className={`text-[10px] mt-0.5 font-medium ${diffInvestment >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                              {diffInvestment >= 0 ? '▲' : '▼'} {Math.abs(diffInvestment).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} ({periodLabel})
                            </p>
                          </div>
                        </div>
                        
                        {/* Actions Row */}
                        <div className="flex flex-col gap-2 pt-3.5 border-t border-zinc-800/40">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingAdsClient({
                                clientId: client.id,
                                clientName: client.name,
                                month: selectedMonth,
                                impressions,
                                clicks,
                                investment,
                                conversions
                              });
                              setIsEditAdsDialogOpen(true);
                            }}
                            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 text-[11px] font-bold rounded-lg transition cursor-pointer"
                          >
                            <Pencil className="w-3.5 h-3.5" /> Editar Métricas Manuais
                          </button>
                          
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => handleExportAdsCSV(client)}
                              className="flex items-center justify-center gap-1 py-1.5 px-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-850 text-[10px] font-semibold text-zinc-350 rounded transition cursor-pointer"
                            >
                              <Download className="w-3 h-3 text-zinc-500" /> CSV
                            </button>
                            <button
                              type="button"
                              onClick={() => handleExportAdsPDF(client)}
                              className="flex items-center justify-center gap-1 py-1.5 px-2 bg-zinc-800 hover:bg-zinc-700 text-[10px] font-semibold text-white rounded transition cursor-pointer"
                            >
                              <Download className="w-3 h-3" /> PDF
                            </button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>

            {/* Edit Ads Metrics Dialog */}
            {editingAdsClient && (
              <Dialog open={isEditAdsDialogOpen} onOpenChange={setIsEditAdsDialogOpen}>
                <DialogContent className="bg-zinc-900 border border-zinc-800 text-white max-w-md w-[95vw]">
                  <DialogHeader>
                    <DialogTitle>Editar Métricas Ads (Google Ads)</DialogTitle>
                    <DialogDescription className="text-zinc-400">
                      Editando métricas de {editingAdsClient.clientName} para o período de {editingAdsClient.month}.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleUpdateAdsMetrics} className="space-y-4 py-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="ads-edit-imp" className="text-zinc-300">Impressões</Label>
                        <Input 
                          id="ads-edit-imp" 
                          type="number"
                          value={editingAdsClient.impressions} 
                          onChange={e => setEditingAdsClient({...editingAdsClient, impressions: Number(e.target.value)})} 
                          className="bg-zinc-950 border-zinc-800 text-white" 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="ads-edit-cli" className="text-zinc-300">Cliques</Label>
                        <Input 
                          id="ads-edit-cli" 
                          type="number"
                          value={editingAdsClient.clicks} 
                          onChange={e => setEditingAdsClient({...editingAdsClient, clicks: Number(e.target.value)})} 
                          className="bg-zinc-950 border-zinc-800 text-white" 
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="ads-edit-con" className="text-zinc-300">Conversões</Label>
                        <Input 
                          id="ads-edit-con" 
                          type="number"
                          value={editingAdsClient.conversions} 
                          onChange={e => setEditingAdsClient({...editingAdsClient, conversions: Number(e.target.value)})} 
                          className="bg-zinc-950 border-zinc-800 text-white" 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="ads-edit-inv" className="text-zinc-300">Investimento Semanal (R$)</Label>
                        <Input 
                          id="ads-edit-inv" 
                          type="number"
                          value={editingAdsClient.investment} 
                          onChange={e => setEditingAdsClient({...editingAdsClient, investment: Number(e.target.value)})} 
                          className="bg-zinc-950 border-zinc-800 text-white" 
                        />
                      </div>
                    </div>

                    <div className="bg-zinc-950/40 p-3 rounded-lg border border-zinc-850 text-[11px] text-zinc-400 space-y-1">
                      <p><span className="font-semibold text-white">CPC Calculado:</span> R$ {Number((editingAdsClient.investment / (editingAdsClient.clicks || 1)).toFixed(2)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                      <p><span className="font-semibold text-white">CPA Calculado:</span> R$ {Number((editingAdsClient.investment / (editingAdsClient.conversions || 1)).toFixed(2)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    </div>

                    <DialogFooter className="mt-6">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsEditAdsDialogOpen(false)}
                        className="border-zinc-800 hover:bg-zinc-800 text-zinc-300"
                      >
                        Cancelar
                      </Button>
                      <Button type="submit" className="bg-zinc-100 hover:bg-zinc-200 text-zinc-950">
                        Salvar Métricas
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        )}

        {/* --- 6. SETTINGS / CONFIGURACOES MODULE --- */}
        {activeTab === 'configuracoes' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white">Configurações do Portal</h2>
              <p className="text-sm text-zinc-400">Preferências do sistema, permissões, serviços e aparência do dashboard.</p>
            </div>

            {/* Submenu Navigation */}
            <div className="flex border-b border-zinc-800 gap-6 pb-2 text-xs overflow-x-auto whitespace-nowrap">
              <button 
                type="button"
                onClick={() => setActiveSettingsSubTab('profile_corp')}
                className={`pb-2 px-1 font-semibold transition border-b-2 -mb-2.5 cursor-pointer flex items-center gap-1.5 ${
                  activeSettingsSubTab === 'profile_corp' ? 'border-white text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <UserIcon className="w-3.5 h-3.5" />
                Dados Pessoais e Corporativos
              </button>
              <button 
                type="button"
                onClick={() => setActiveSettingsSubTab('services')}
                className={`pb-2 px-1 font-semibold transition border-b-2 -mb-2.5 cursor-pointer flex items-center gap-1.5 ${
                  activeSettingsSubTab === 'services' ? 'border-white text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                Serviços Prestados
              </button>
              <button 
                type="button"
                onClick={() => setActiveSettingsSubTab('appearance')}
                className={`pb-2 px-1 font-semibold transition border-b-2 -mb-2.5 cursor-pointer flex items-center gap-1.5 ${
                  activeSettingsSubTab === 'appearance' ? 'border-white text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <Palette className="w-3.5 h-3.5" />
                Aparência
              </button>
              <button 
                type="button"
                onClick={() => setActiveSettingsSubTab('audit')}
                className={`pb-2 px-1 font-semibold transition border-b-2 -mb-2.5 cursor-pointer flex items-center gap-1.5 ${
                  activeSettingsSubTab === 'audit' ? 'border-white text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                Logs de Auditoria
              </button>
              <button 
                type="button"
                onClick={() => setActiveSettingsSubTab('database')}
                className={`pb-2 px-1 font-semibold transition border-b-2 -mb-2.5 cursor-pointer flex items-center gap-1.5 ${
                  activeSettingsSubTab === 'database' ? 'border-white text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                Banco de Dados & Sandbox
              </button>
            </div>

            <div className="pt-4 space-y-6">
              
              {/* Profile & Corporate Sub-tab */}
              {activeSettingsSubTab === 'profile_corp' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                  {/* Personal Profile Info */}
                  <Card className="bg-[#1e1e24] border-zinc-800/80 animate-fadeIn">
                    <CardHeader>
                      <CardTitle className="text-sm font-semibold text-white flex items-center gap-1.5">
                        <UserIcon className="w-4 h-4 text-zinc-400" />
                        Dados Pessoais do Perfil
                      </CardTitle>
                      <CardDescription className="text-zinc-500">Credenciais e privilégios da sua sessão atual.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-zinc-400">Nome Completo</Label>
                        <Input disabled value={user.name} className="bg-zinc-950 border-zinc-800 text-zinc-300" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-zinc-400">E-mail de Login</Label>
                        <Input disabled value={user.email} className="bg-zinc-950 border-zinc-800 text-zinc-300" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-zinc-400">Nível de Acesso</Label>
                        <Input disabled value={user.role} className="bg-zinc-950 border-zinc-800 text-zinc-300" />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Corporate Agency Info */}
                  <Card className="bg-[#1e1e24] border-zinc-800/80 animate-fadeIn">
                    <CardHeader>
                      <CardTitle className="text-sm font-semibold text-white flex items-center gap-1.5">
                        <Briefcase className="w-4 h-4 text-zinc-400" />
                        Dados Corporativos da Agência
                      </CardTitle>
                      <CardDescription className="text-zinc-500">Métricas financeiras e dados fiscais de exibição geral.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleSaveCorpInfo} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="corp-razao" className="text-zinc-400">Razão Social</Label>
                          <Input 
                            id="corp-razao" 
                            value={corpInfo.razaoSocial} 
                            onChange={e => setCorpInfo({...corpInfo, razaoSocial: e.target.value})}
                            className="bg-zinc-950 border-zinc-800 text-white" 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="corp-cnpj" className="text-zinc-400">CNPJ da Empresa</Label>
                          <Input 
                            id="corp-cnpj" 
                            value={corpInfo.cnpj} 
                            onChange={e => setCorpInfo({...corpInfo, cnpj: e.target.value})}
                            className="bg-zinc-950 border-zinc-800 text-white" 
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="corp-meta" className="text-zinc-400">Meta Faturamento (R$)</Label>
                            <Input 
                              id="corp-meta" 
                              type="number"
                              value={corpInfo.metaFaturamento} 
                              onChange={e => setCorpInfo({...corpInfo, metaFaturamento: e.target.value})}
                              className="bg-zinc-950 border-zinc-800 text-white" 
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="corp-tz" className="text-zinc-400">Timezone</Label>
                            <Select 
                              value={corpInfo.timezone} 
                              onValueChange={val => setCorpInfo({...corpInfo, timezone: val || 'America/Sao_Paulo'})}
                            >
                              <SelectTrigger className="bg-zinc-950 border-zinc-800 text-white">
                                <SelectValue placeholder="Timezone" />
                              </SelectTrigger>
                              <SelectContent className="bg-zinc-900 border border-zinc-800 text-white">
                                <SelectItem value="America/Sao_Paulo">Brasília (GMT-3)</SelectItem>
                                <SelectItem value="America/New_York">Nova York (GMT-5)</SelectItem>
                                <SelectItem value="Europe/London">Londres (GMT+0)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <Button type="submit" className="w-full bg-zinc-100 hover:bg-zinc-200 text-zinc-950 text-xs font-semibold cursor-pointer">
                          Salvar Dados Corporativos
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Services & Groups Sub-tab */}
              {activeSettingsSubTab === 'services' && (
                <div className="space-y-6">
                  {/* Top addition forms */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Add Single Service */}
                    <Card className="bg-[#1e1e24] border-zinc-800/80 animate-fadeIn">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-semibold text-white">Adicionar Serviço Individual</CardTitle>
                        <CardDescription className="text-zinc-500">Insira um novo serviço autônomo nas listagens dinâmicas.</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <form onSubmit={handleAddService} className="flex gap-2">
                          <Input 
                            placeholder="Ex: Marketing de Influência" 
                            value={newServiceName} 
                            onChange={e => setNewServiceName(e.target.value)} 
                            className="bg-zinc-950 border-zinc-800 text-white text-xs" 
                          />
                          <Button type="submit" className="bg-zinc-100 hover:bg-zinc-200 text-zinc-950 text-xs font-semibold shrink-0 cursor-pointer">
                            Adicionar
                          </Button>
                        </form>
                      </CardContent>
                    </Card>

                    {/* Add Service Group */}
                    <Card className="bg-[#1e1e24] border-zinc-800/80 animate-fadeIn">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-semibold text-white">Criar Grupo de Serviços</CardTitle>
                        <CardDescription className="text-zinc-500">Agrupe múltiplos serviços individuais em um único combo comercial.</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <form onSubmit={handleAddServiceGroup} className="space-y-3">
                          <Input 
                            placeholder="Nome do Combo (Ex: Combo SEO + Local)" 
                            value={newGroupName} 
                            onChange={e => setNewGroupName(e.target.value)} 
                            className="bg-zinc-950 border-zinc-800 text-white text-xs" 
                          />
                          <div className="space-y-1.5 p-2 bg-zinc-950/40 border border-zinc-850 rounded-lg max-h-32 overflow-y-auto">
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">Selecione os Serviços Inclusos:</span>
                            {availableServices.map(s => {
                              const checked = selectedGroupServices.includes(s);
                              return (
                                <div key={s} className="flex items-center gap-2 text-xs py-0.5">
                                  <input 
                                    type="checkbox"
                                    id={`group-srv-${s}`}
                                    checked={checked}
                                    onChange={(e) => {
                                      const isChecked = e.target.checked;
                                      if (isChecked) {
                                        setSelectedGroupServices([...selectedGroupServices, s]);
                                      } else {
                                        setSelectedGroupServices(selectedGroupServices.filter(item => item !== s));
                                      }
                                    }}
                                    className="accent-zinc-100 rounded border-zinc-700 bg-zinc-950 text-white cursor-pointer"
                                  />
                                  <Label htmlFor={`group-srv-${s}`} className="text-zinc-300 font-normal cursor-pointer">{s}</Label>
                                </div>
                              );
                            })}
                          </div>
                          <Button type="submit" disabled={!newGroupName.trim() || selectedGroupServices.length < 2} className="w-full bg-zinc-800 hover:bg-zinc-750 text-white border border-zinc-700/60 text-xs font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                            Criar Grupo de Serviços
                          </Button>
                        </form>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Main Services Table (Structured like clients table) */}
                  <Card className="bg-[#1e1e24] border-zinc-800/80 animate-fadeIn">
                    <CardHeader>
                      <CardTitle className="text-sm font-semibold text-white">Listagem de Serviços e Combos</CardTitle>
                      <CardDescription className="text-zinc-500">Tabela completa de todas as atividades disponíveis para contratação de clientes.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0 border-t border-zinc-800/60">
                      <Table>
                        <TableHeader className="bg-zinc-900/30">
                          <TableRow className="border-b border-zinc-800/80">
                            <TableHead className="text-zinc-400 font-semibold text-xs pl-6">Nome do Serviço / Combo</TableHead>
                            <TableHead className="text-zinc-400 font-semibold text-xs">Tipo</TableHead>
                            <TableHead className="text-zinc-400 font-semibold text-xs">Serviços Integrados</TableHead>
                            <TableHead className="text-zinc-400 font-semibold text-xs text-right pr-6">Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {/* Render Individual Services */}
                          {availableServices.map(service => (
                            <TableRow key={service} className="border-b border-zinc-850 hover:bg-zinc-900/10">
                              <TableCell className="font-semibold text-white text-xs pl-6">{service}</TableCell>
                              <TableCell>
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-900 text-zinc-400 border border-zinc-800">
                                  Individual
                                </span>
                              </TableCell>
                              <TableCell className="text-zinc-500 text-[11px]">—</TableCell>
                              <TableCell className="text-right pr-6">
                                <button 
                                  type="button" 
                                  onClick={() => handleDeleteService(service)}
                                  className="p-1.5 text-zinc-500 hover:text-red-400 transition cursor-pointer hover:bg-red-950/15 rounded"
                                  title="Remover serviço"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </TableCell>
                            </TableRow>
                          ))}

                          {/* Render Service Groups */}
                          {serviceGroups.map(group => (
                            <TableRow key={group.id} className="border-b border-zinc-850 hover:bg-zinc-900/10">
                              <TableCell className="font-semibold text-white text-xs pl-6">{group.name}</TableCell>
                              <TableCell>
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-900/30">
                                  Grupo / Combo
                                </span>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-wrap gap-1">
                                  {group.services.map(subSrv => (
                                    <span key={subSrv} className="bg-zinc-900/60 border border-zinc-800 text-zinc-300 text-[9px] px-1.5 py-0.5 rounded">
                                      {subSrv}
                                    </span>
                                  ))}
                                </div>
                              </TableCell>
                              <TableCell className="text-right pr-6">
                                <button 
                                  type="button" 
                                  onClick={() => handleDeleteServiceGroup(group.id)}
                                  className="p-1.5 text-zinc-500 hover:text-red-400 transition cursor-pointer hover:bg-red-950/15 rounded"
                                  title="Excluir grupo"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Appearance Settings Sub-tab */}
              {activeSettingsSubTab === 'appearance' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                  <Card className="bg-[#1e1e24] border-zinc-800/80 animate-fadeIn">
                    <CardHeader>
                      <CardTitle className="text-sm font-semibold text-white flex items-center gap-1.5">
                        <Type className="w-4 h-4 text-zinc-400" />
                        Tamanho da Fonte
                      </CardTitle>
                      <CardDescription className="text-zinc-500">Dimensione os textos do painel para facilitar sua legibilidade.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-zinc-950/50 border border-zinc-850 rounded-xl">
                        <span className="text-xs text-zinc-400">Texto Pequeno (Padrão Condensado)</span>
                        <Button 
                          onClick={() => handleFontSizeChange('sm')}
                          variant={fontSize === 'sm' ? 'default' : 'outline'}
                          className={`text-xs h-8 ${fontSize === 'sm' ? 'bg-white text-zinc-950 hover:bg-zinc-200' : 'border-zinc-800 text-zinc-300'}`}
                        >
                          Pequeno (xs)
                        </Button>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-zinc-950/50 border border-zinc-850 rounded-xl">
                        <span className="text-xs text-zinc-400">Texto Médio (Padrão Web)</span>
                        <Button 
                          onClick={() => handleFontSizeChange('base')}
                          variant={fontSize === 'base' ? 'default' : 'outline'}
                          className={`text-xs h-8 ${fontSize === 'base' ? 'bg-white text-zinc-950 hover:bg-zinc-200' : 'border-zinc-800 text-zinc-300'}`}
                        >
                          Normal (sm)
                        </Button>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-zinc-950/50 border border-zinc-850 rounded-xl">
                        <span className="text-xs text-zinc-400">Texto Grande (Melhor Leitura)</span>
                        <Button 
                          onClick={() => handleFontSizeChange('lg')}
                          variant={fontSize === 'lg' ? 'default' : 'outline'}
                          className={`text-xs h-8 ${fontSize === 'lg' ? 'bg-white text-zinc-950 hover:bg-zinc-200' : 'border-zinc-800 text-zinc-300'}`}
                        >
                          Grande (base)
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-[#1e1e24] border-zinc-800/80 animate-fadeIn">
                    <CardHeader>
                      <CardTitle className="text-sm font-semibold text-white flex items-center gap-1.5">
                        <Palette className="w-4 h-4 text-zinc-400" />
                        Tema de Cores (Sidebar Destaques)
                      </CardTitle>
                      <CardDescription className="text-zinc-500">Mude a cor de destaque principal nos menus navegáveis.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4">
                      <button 
                        onClick={() => handleAccentColorChange('zinc')}
                        className={`flex flex-col items-center justify-center p-4 bg-zinc-950/50 border rounded-xl gap-2 transition-all duration-300 hover:bg-zinc-900/80 hover:border-zinc-500 hover:scale-[1.02] cursor-pointer ${
                          accentColor === 'zinc' ? 'border-white text-white' : 'border-zinc-850 text-zinc-450'
                        }`}
                      >
                        <span className="w-4 h-4 rounded-full bg-zinc-400 inline-block shadow-inner transition-transform group-hover:scale-110" />
                        <span className="text-[11px] font-semibold">Chumbo / Zinco</span>
                      </button>

                      <button 
                        onClick={() => alert('Tema em desenvolvimento: O tema Verde Esmeralda estará disponível em breve.')}
                        className="flex flex-col items-center justify-center p-4 bg-zinc-950/20 border border-zinc-850/50 rounded-xl gap-2 transition-all duration-300 hover:bg-zinc-900/40 hover:border-zinc-800 opacity-60 cursor-pointer relative overflow-hidden group"
                      >
                        <span className="absolute top-1 right-1 text-[8px] bg-yellow-950 text-yellow-400 px-1 rounded font-mono font-bold uppercase tracking-wider scale-90">Em Dev</span>
                        <span className="w-4 h-4 rounded-full bg-emerald-500/50 inline-block shadow-inner" />
                        <span className="text-[11px] font-semibold text-zinc-500 group-hover:text-zinc-400">Verde Esmeralda</span>
                      </button>

                      <button 
                        onClick={() => alert('Tema em desenvolvimento: O tema Azul Royal estará disponível em breve.')}
                        className="flex flex-col items-center justify-center p-4 bg-zinc-950/20 border border-zinc-850/50 rounded-xl gap-2 transition-all duration-300 hover:bg-zinc-900/40 hover:border-zinc-800 opacity-60 cursor-pointer relative overflow-hidden group"
                      >
                        <span className="absolute top-1 right-1 text-[8px] bg-yellow-950 text-yellow-400 px-1 rounded font-mono font-bold uppercase tracking-wider scale-90">Em Dev</span>
                        <span className="w-4 h-4 rounded-full bg-blue-500/50 inline-block shadow-inner" />
                        <span className="text-[11px] font-semibold text-zinc-500 group-hover:text-zinc-400">Azul Royal</span>
                      </button>

                      <button 
                        onClick={() => alert('Tema em desenvolvimento: O tema Roxo Purpurina estará disponível em breve.')}
                        className="flex flex-col items-center justify-center p-4 bg-zinc-950/20 border border-zinc-850/50 rounded-xl gap-2 transition-all duration-300 hover:bg-zinc-900/40 hover:border-zinc-800 opacity-60 cursor-pointer relative overflow-hidden group"
                      >
                        <span className="absolute top-1 right-1 text-[8px] bg-yellow-950 text-yellow-400 px-1 rounded font-mono font-bold uppercase tracking-wider scale-90">Em Dev</span>
                        <span className="w-4 h-4 rounded-full bg-purple-500/50 inline-block shadow-inner" />
                        <span className="text-[11px] font-semibold text-zinc-500 group-hover:text-zinc-400">Roxo Purpurina</span>
                      </button>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Audit Logs Sub-tab */}
              {activeSettingsSubTab === 'audit' && (
                <Card className="bg-[#1e1e24] border-zinc-800/80 animate-fadeIn">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle className="text-sm font-semibold text-white">Logs de Auditoria e Atividades</CardTitle>
                        <CardDescription className="text-zinc-500">Histórico de ações críticas realizadas por usuários nas últimas sessões.</CardDescription>
                      </div>
                      <span className="bg-zinc-950 border border-zinc-800 text-[10px] font-mono text-zinc-400 px-2 py-0.5 rounded">
                        {auditLogs.length} LOGS
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0 border-t border-zinc-800/60">
                    <div className="max-h-96 overflow-y-auto divide-y divide-zinc-850">
                      {auditLogs.map(log => (
                        <div key={log.id} className="p-3 px-6 flex justify-between items-center text-xs hover:bg-zinc-900/10 transition">
                          <div>
                            <span className="font-semibold text-white">{log.user}</span>
                            <span className="text-zinc-400 ml-2">{log.action}</span>
                          </div>
                          <span className="text-[10px] text-zinc-500 font-mono">
                            {new Date(log.timestamp).toLocaleString('pt-BR')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Database & Sandbox Sub-tab */}
              {activeSettingsSubTab === 'database' && (
                <div className="space-y-6 animate-fadeIn">
                  <Card className="bg-[#1e1e24] border-zinc-800/80">
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

                  {/* Developer / Version Info Card */}
                  <Card className="bg-[#1e1e24] border-zinc-800/80">
                    <CardHeader>
                      <CardTitle className="text-sm font-semibold text-white flex items-center gap-1.5">
                        <Sliders className="w-4 h-4 text-zinc-400" />
                        Informações do Sistema (Devs)
                      </CardTitle>
                      <CardDescription className="text-zinc-500">Detalhes técnicos de build e frameworks em execução.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 max-w-sm text-xs">
                      <div className="flex justify-between items-center py-1.5 border-b border-zinc-800/60">
                        <span className="text-zinc-450">Versão do App:</span>
                        <span className="text-white font-mono font-semibold bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">v1.4.2-stable</span>
                      </div>
                      <div className="flex justify-between items-center py-1.5 border-b border-zinc-800/60">
                        <span className="text-zinc-450">Ambiente:</span>
                        <span className="text-white font-mono">Development (Localhost)</span>
                      </div>
                      <div className="flex justify-between items-center py-1.5 border-b border-zinc-800/60">
                        <span className="text-zinc-450">Framework Core:</span>
                        <span className="text-white font-mono">Next.js v15.1.3 (App Router)</span>
                      </div>
                      <div className="flex justify-between items-center py-1.5">
                        <span className="text-zinc-450">Bibliotecas Gráficas:</span>
                        <span className="text-white font-mono">React v19.0.0 / Tailwind CSS</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

            </div>
          </div>
        )}
        
      </main>
      </div>
    </div>
  );
}
