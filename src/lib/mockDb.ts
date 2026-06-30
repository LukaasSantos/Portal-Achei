export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  contractValue: number;
  status: 'Ativo' | 'Pausado' | 'Cancelado';
  serviceType: string;
  startDate: string;
}

export interface Lead {
  id: string;
  name: string;
  company: string;
  email: string;
  value: number;
  status: 'new' | 'contact' | 'proposal' | 'won' | 'lost';
  notes?: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'receita' | 'despesa';
  category: string;
  date: string;
}

export interface SubmittedLead {
  contactDate: string;
  name: string;
  phone: string;
  campaign: string;
  sold: 'Sim' | 'Não' | 'Em Andamento';
  whyNotSold?: string;
}

export interface FormSubmission {
  id: string;
  clientId: string;
  clientName: string;
  month: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  
  // Validação dos Leads (First lead / Backward compatibility fallback)
  leadContactDate: string;
  leadName: string;
  leadPhone: string;
  leadCampaign: string;
  leadSold: 'Sim' | 'Não' | 'Em Andamento';
  leadWhyNotSold?: string;

  // Support for multiple leads
  leads?: SubmittedLead[];

  // Atualização de dados
  topGoogleCampaign: string;
  topPositiveKeywords: string;
  negativeKeywordsToUpdate: string;
  salesTeamObservations?: string;
}

export interface ServiceGroup {
  id: string;
  name: string;
  services: string[];
}


const INITIAL_USERS = [
  { id: '1', email: 'lucas.tas@live.com', name: 'Lucas Tas', password: 'lucas123', role: 'Administrador' },
  { id: '2', email: 'dalete.achei@hotmail.com', name: 'Dálete Achei', password: 'dalete123', role: 'Administrador' }
];

const INITIAL_CLIENTS: Client[] = [
  { id: 'c1', name: 'Coca Cola BR', email: 'marketing@cocacola.com.br', phone: '(11) 98888-7777', contractValue: 12000, status: 'Ativo', serviceType: 'Gestão de Tráfego', startDate: '2026-01-10' },
  { id: 'c2', name: 'Nike Brasil', email: 'contato@nike.com.br', phone: '(11) 97777-6666', contractValue: 15000, status: 'Ativo', serviceType: 'Redes Sociais & Branding', startDate: '2026-02-15' },
  { id: 'c3', name: 'Padaria do Zé', email: 'contato@padariaze.com.br', phone: '(11) 96666-5555', contractValue: 1500, status: 'Pausado', serviceType: 'SEO Local', startDate: '2026-03-01' },
  { id: 'c4', name: 'Stark Industries', email: 'pepper@stark.com', phone: '(11) 95555-4444', contractValue: 25000, status: 'Ativo', serviceType: 'Marketing de Conteúdo', startDate: '2026-04-20' },
  { id: 'c5', name: 'Tech Inovações', email: 'financeiro@techinova.com', phone: '(11) 94444-3333', contractValue: 5000, status: 'Cancelado', serviceType: 'Desenvolvimento Web', startDate: '2026-05-01' }
];

const INITIAL_LEADS: Lead[] = [
  { id: 'l1', name: 'Carlos Andrade', company: 'Andrade Advogados', email: 'carlos@andrade.com', value: 4000, status: 'new', notes: 'Interessado em tráfego pago para captar clientes.', updatedAt: '2026-06-25' },
  { id: 'l2', name: 'Mariana Rios', company: 'Rios Construtora', email: 'mariana@rios.com.br', value: 8000, status: 'contact', notes: 'Fizemos a primeira reunião de diagnóstico.', updatedAt: '2026-06-24' },
  { id: 'l3', name: 'Roberto Alencar', company: 'Hamburgueria BurgerTop', email: 'roberto@burgertop.com', value: 2500, status: 'proposal', notes: 'Proposta enviada de R$ 2.500/mês para Instagram e Google Ads.', updatedAt: '2026-06-23' },
  { id: 'l4', name: 'Beatriz Silva', company: 'Clinica Sorriso', email: 'beatriz@clinicasorriso.com', value: 3500, status: 'won', notes: 'Contrato fechado! Enviado para onboarding.', updatedAt: '2026-06-22' },
  { id: 'l5', name: 'Fernando Dias', company: 'E-commerce Outlets', email: 'fernando@outletsdias.com', value: 12000, status: 'lost', notes: 'Achou o valor acima do orçamento atual.', updatedAt: '2026-06-21' }
];

const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: 't1', description: 'Mensalidade Coca Cola BR', amount: 12000, type: 'receita', category: 'Gestão de Tráfego', date: '2026-06-05' },
  { id: 't2', description: 'Mensalidade Nike Brasil', amount: 15000, type: 'receita', category: 'Redes Sociais', date: '2026-06-10' },
  { id: 't3', description: 'Assinatura Adobe Creative Cloud', amount: 350, type: 'despesa', category: 'Ferramentas', date: '2026-06-12' },
  { id: 't4', description: 'Anúncios Google (Agência)', amount: 1200, type: 'despesa', category: 'Marketing', date: '2026-06-15' },
  { id: 't5', description: 'Mensalidade Stark Industries', amount: 25000, type: 'receita', category: 'Marketing Conteúdo', date: '2026-06-20' },
  { id: 't6', description: 'Salários Equipe', amount: 18000, type: 'despesa', category: 'Pessoal', date: '2026-06-25' },
  { id: 't7', description: 'Aluguel do Escritório Co-working', amount: 2000, type: 'despesa', category: 'Infraestrutura', date: '2026-06-25' }
];

const isServer = typeof window === 'undefined';

const INITIAL_SERVICES = [
  'Gestão de Tráfego',
  'Redes Sociais & Branding',
  'SEO Local',
  'Desenvolvimento Web',
  'Marketing de Conteúdo'
];

const INITIAL_SERVICE_GROUPS: ServiceGroup[] = [
  { id: 'g1', name: 'Combo Ads & Social', services: ['Gestão de Tráfego', 'Redes Sociais & Branding'] },
  { id: 'g2', name: 'Presença Digital Completa', services: ['SEO Local', 'Desenvolvimento Web', 'Redes Sociais & Branding'] }
];

function getStorageItem<T>(key: string, defaultValue: T): T {
  if (isServer) return defaultValue;
  const item = localStorage.getItem(key);
  return item ? JSON.parse(item) : defaultValue;
}

function setStorageItem<T>(key: string, value: T): void {
  if (!isServer) {
    localStorage.setItem(key, JSON.stringify(value));
  }
}

export const mockDb = {
  getUsers: () => {
    const users = getStorageItem('db_users', INITIAL_USERS);
    if (!users.some((u: any) => u.email === 'dalete.achei@hotmail.com')) {
      setStorageItem('db_users', INITIAL_USERS);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_session');
      }
      return INITIAL_USERS;
    }
    return users;
  },
  addUser: (user: any) => {
    const users = mockDb.getUsers();
    users.push(user);
    setStorageItem('db_users', users);
  },
  
  getClients: (): Client[] => getStorageItem('db_clients', INITIAL_CLIENTS),
  saveClients: (clients: Client[]) => setStorageItem('db_clients', clients),
  
  getLeads: (): Lead[] => getStorageItem('db_leads', INITIAL_LEADS),
  saveLeads: (leads: Lead[]) => setStorageItem('db_leads', leads),
  
  getTransactions: (): Transaction[] => getStorageItem('db_transactions', INITIAL_TRANSACTIONS),
  saveTransactions: (transactions: Transaction[]) => setStorageItem('db_transactions', transactions),
  
  getSubmissions: (): FormSubmission[] => getStorageItem('db_submissions', []),
  saveSubmissions: (submissions: FormSubmission[]) => setStorageItem('db_submissions', submissions),
  
  getServices: (): string[] => getStorageItem('db_services', INITIAL_SERVICES),
  saveServices: (services: string[]) => setStorageItem('db_services', services),

  getServiceGroups: (): ServiceGroup[] => getStorageItem('db_service_groups', INITIAL_SERVICE_GROUPS),
  saveServiceGroups: (groups: ServiceGroup[]) => setStorageItem('db_service_groups', groups),

  getProposals: (): Proposal[] => getStorageItem('db_proposals', INITIAL_PROPOSALS),
  saveProposals: (proposals: Proposal[]) => setStorageItem('db_proposals', proposals),

  getCollaborators: (): Collaborator[] => getStorageItem('db_collaborators', INITIAL_COLLABORATORS),
  saveCollaborators: (collaborators: Collaborator[]) => setStorageItem('db_collaborators', collaborators)
};

export interface Collaborator {
  id: string;
  name: string;
  role: string;
  company: string;
  email?: string;
  phone?: string;
}

export interface ProposalItem {
  name: string;
  quantity: number;
  price: number;
  collaboratorId?: string;
}

export interface Proposal {
  id: string;
  proposalNumber: string;
  date: string;
  validityDate: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  items: ProposalItem[];
  subtotal: number;
  discount: number;
  total: number;
  observations: string;
  createdAt: string;
}

const INITIAL_COLLABORATORS: Collaborator[] = [
  { id: 'col_lucas', name: 'Lucas Santos', role: 'dev', company: 'achei', email: 'lucas.santos@achei.com.br' },
  { id: 'col_keyla', name: 'Keyla', role: 'mkt', company: 'mid', email: 'keyla@mid.com.br' },
  { id: 'col_haissa', name: 'Haissa', role: 'mkt', company: 'brit', email: 'haissa@brit.com.br' }
];

const INITIAL_PROPOSALS: Proposal[] = [
  {
    id: 'prop1',
    proposalNumber: '2026066474',
    date: '2026-06-29',
    validityDate: '2026-07-02',
    clientName: 'Priscila Queiroz',
    clientPhone: '(11) 99549-6916',
    clientEmail: 'evolutioadh@gmail.com',
    items: [
      { name: 'Comunicação Verbal', quantity: 1, price: 6000, collaboratorId: 'col_keyla' },
      { name: 'Comunicação Visual', quantity: 1, price: 2500, collaboratorId: 'col_haissa' },
      { name: 'Desenvolvimento de Landing Page Premium', quantity: 1, price: 2500, collaboratorId: 'col_lucas' }
    ],
    subtotal: 11000,
    discount: 5500,
    total: 5500,
    observations: 'Forma de pagamento: Boleto ou Pix - MID (R$2000,00) / BRIT (R$1500,00) / ACHEI (R$1500,00)\nDesconto: R$ 5.500,00 - Fechando em conjunto\nObs.: Pagamento da MID é realizado em 3 meses\nPagamento BRIT é recorrente\nPagamento Achei no primeiro mês\n\nProjeção para 3 meses\nManutenção Site e criação de Blog R$600,00 mês\nTráfego Pago Google + Meta R$3500,00 mês (Negociável)',
    createdAt: '2026-06-29T21:44:00.000Z'
  }
];


