# Plano de Implementação: Backend PHP & PostgreSQL (Portal.Achei)

Este plano descreve as etapas para substituir o banco de dados simulado local (`mockDb.ts`) por um backend robusto em PHP (usando Laravel ou Slim Framework) integrado a um banco de dados PostgreSQL.

---

## 🛠️ Decisões Arquiteturais Propostas

1. **Framework PHP:** **Laravel (Recomendado)** para agilizar o desenvolvimento com Eloquent ORM, migrações integradas e autenticação nativa (Laravel Sanctum/JWT). Alternativamente, **Slim Framework** para uma API puramente minimalista.
2. **Banco de Dados:** **PostgreSQL** hospedado localmente ou em serviço gerenciado (ex: Supabase, Neon ou AWS RDS).
3. **Autenticação:** **JWT (JSON Web Tokens)** ou **Laravel Sanctum (Stateful tokens)**. A API emitirá tokens JWT para o frontend Next.js enviar no cabeçalho `Authorization: Bearer <token>`.
4. **Integração Frontend:** Adaptação do `src/lib/authContext.tsx` e criação de um cliente HTTP (Axios ou Fetch nativo) para substituir chamadas ao `localStorage` por requisições HTTP reais à API PHP.

---

## 🗄️ Esquema do Banco de Dados (PostgreSQL)

Aqui está a estrutura de tabelas proposta para refletir as necessidades do sistema:

```sql
-- Extensão para IDs únicos universais (UUID) se preferir ao invés de IDs numéricos simples
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABELA DE USUÁRIOS
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, -- Senhas com hash bcrypt
    role VARCHAR(50) DEFAULT 'Funcionário' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. TABELA DE CLIENTES
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    contract_value NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(50) CHECK (status IN ('Ativo', 'Pausado', 'Cancelado')) DEFAULT 'Ativo' NOT NULL,
    service_type VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. TABELA DE LEADS (CRM)
CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    value NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(50) CHECK (status IN ('new', 'contact', 'proposal', 'won', 'lost')) DEFAULT 'new' NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. TABELA DE TRANSAÇÕES (Financeiro)
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    description VARCHAR(255) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    type VARCHAR(20) CHECK (type IN ('receita', 'despesa')) NOT NULL,
    category VARCHAR(100) NOT NULL,
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🌐 Especificação das Rotas da API (Endpoints)

Todas as rotas da API (exceto as de autenticação pública) exigirão o cabeçalho `Authorization: Bearer <JWT_TOKEN>`.

### 1. Autenticação (`/api/auth`)
- `POST /api/auth/register` - Registro de novo funcionário.
- `POST /api/auth/login` - Retorna os dados do usuário e o token JWT.
- `GET /api/auth/me` - Retorna os dados do usuário logado através do token enviado.

### 2. Clientes (`/api/clients`)
- `GET /api/clients` - Listagem de todos os clientes.
- `POST /api/clients` - Cadastro de cliente.
- `PUT /api/clients/{id}` - Edição de cliente.
- `DELETE /api/clients/{id}` - Exclusão de cliente.

### 3. CRM / Leads (`/api/leads`)
- `GET /api/leads` - Listagem de leads.
- `POST /api/leads` - Cadastro de novo lead.
- `PUT /api/leads/{id}` - Edição ou atualização do estágio/notas do lead.
- `DELETE /api/leads/{id}` - Exclusão de lead.

### 4. Financeiro (`/api/transactions`)
- `GET /api/transactions` - Extrato financeiro.
- `POST /api/transactions` - Lançar receita ou despesa.
- `PUT /api/transactions/{id}` - Edição de transação.
- `DELETE /api/transactions/{id}` - Remoção de lançamento financeiro.

---

## 🛠️ Etapas do Plano de Ação

### Etapa 1: Setup do Projeto Backend PHP
- [ ] Inicializar o projeto backend (ex: `composer create-project laravel/laravel backend-api`).
- [ ] Configurar conexão do PostgreSQL no arquivo `.env`.
- [ ] Criar e rodar as Migrations e Seeders correspondentes às tabelas de `users`, `clients`, `leads` e `transactions`.
- [ ] Configurar CORS na API PHP para permitir chamadas originadas do domínio do Next.js (ex: `http://localhost:3000`).

### Etapa 2: Implementação dos Endpoints & Lógica Backend
- [ ] Implementar autenticação JWT no PHP.
- [ ] Desenvolver Controllers e Models para as entidades:
  - `ClientController`, `LeadController`, `TransactionController`.
- [ ] Adicionar validações de payload para garantir integridade dos dados inseridos no banco.

### Etapa 3: Integração do Frontend Next.js
- [ ] Instalar `axios` ou estruturar um cliente `fetch` centralizado com interceptores para anexar o token de autenticação.
- [ ] Atualizar o [authContext.tsx](file:///c:/Users/lucas/OneDrive/Dev/Freelas/Darlet%20Achei/Portal%20Achei/src/lib/authContext.tsx) para realizar chamadas REST nos endpoints de `/api/auth/*` em vez de simular delay com `setTimeout` e acessar o `mockDb`.
- [ ] Substituir as referências diretas ao `mockDb` dentro do [dashboard/page.tsx](file:///c:/Users/lucas/OneDrive/Dev/Freelas/Darlet%20Achei/Portal%20Achei/src/app/dashboard/page.tsx) por chamadas de API (`GET`, `POST`, `PUT`, `DELETE`).

---

## ⚠️ Necessidades e Etapas Manuais (Ação do Usuário)

As seguintes atividades precisam ser feitas manualmente no ambiente local ou no servidor:

1. **Instalação do Servidor PHP & PostgreSQL:**
   - Garantir que o PHP (versão >= 8.2) e o Composer estejam instalados localmente.
   - Instalar o PostgreSQL e criar um banco de dados chamado `portal_achei` (ou similar).
2. **Definição de Variáveis de Ambiente (`.env`):**
   - Configurar as credenciais do PostgreSQL no `.env` do backend PHP (`DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`).
   - Configurar a chave secreta de assinatura JWT (`JWT_SECRET`).
   - Configurar o `.env` do Next.js com a URL base da API PHP (ex: `NEXT_PUBLIC_API_URL=http://localhost:8000`).
3. **Execução de Comandos Iniciais no Terminal (Backend):**
   - Rodar `composer install` para baixar as dependências PHP.
   - Executar `php artisan migrate --seed` para criar a estrutura das tabelas e povoar com os usuários de teste iniciais no PostgreSQL.
4. **Deploy & Servidores:**
   - Em produção, será necessário configurar um servidor web (como Nginx ou Apache) para interpretar o PHP (usando PHP-FPM) ou utilizar uma plataforma como Heroku/Railway/Render para hospedar o backend PHP e o PostgreSQL.
