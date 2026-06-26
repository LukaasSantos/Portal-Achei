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

const INITIAL_USERS = [
  { id: '1', email: 'lucas.tas@live.com', name: 'Lucas Tas', password: 'lucas123', role: 'Administrador' },
  { id: '2', email: 'darlet.achei@gmail.com', name: 'Dálete Achei', password: 'darlet123', role: 'Administrador' }
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
    if (!users.some((u: any) => u.email === 'dalete.achei@gmail.com')) {
      setStorageItem('db_users', INITIAL_USERS);
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
  saveTransactions: (transactions: Transaction[]) => setStorageItem('db_transactions', transactions)
};
