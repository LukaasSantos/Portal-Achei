# Contexto do Projeto: Portal.Achei

Este documento serve para ambientar desenvolvedores e assistentes de IA sobre o funcionamento, estrutura e regras de negócio do **Portal.Achei** (Portal interno da agência Dálete Achei).

---

## 🚀 Stack Tecnológica

- **Framework:** Next.js 16 (App Router)
- **Biblioteca Base:** React 19 & React DOM 19
- **Estilização:** Tailwind CSS v4 (configurado com `@tailwindcss/postcss`)
- **Componentes de UI:** Radix UI / Shadcn (instalado localmente via JSON em `components.json`)
- **Ícones:** Lucide React
- **Gráficos:** Recharts (usado nos dashboards financeiros e de CRM)
- **Linguagem:** TypeScript

---

## 📁 Estrutura do Projeto

Abaixo está o mapeamento dos principais diretórios e arquivos do projeto:

```
Portal Achei/
├── src/
│   ├── app/                    # Rotas do Next.js (App Router)
│   │   ├── dashboard/          # Painel principal do sistema
│   │   │   └── page.tsx        # View principal (clientes, leads, financeiro)
│   │   ├── login/              # Tela de autenticação
│   │   │   └── page.tsx        # Formulários de Login/Cadastro
│   │   ├── globals.css         # Configurações globais de CSS e temas do Tailwind
│   │   ├── layout.tsx          # Layout base com AuthProvider
│   │   └── page.tsx            # Redirecionador automático baseado no login
│   ├── components/             # Componentes reutilizáveis
│   │   ├── ui/                 # Componentes básicos de interface (botões, inputs, tabelas, etc.)
│   │   └── providers.tsx       # Provedores globais do React
│   └── lib/                    # Funções utilitárias e regras de negócio/dados
│       ├── authContext.tsx     # Contexto de autenticação (Login, Cadastro, Logout)
│       ├── mockDb.ts           # Banco de dados simulado no LocalStorage
│       └── utils.ts            # Auxiliares (ex: cn para classes dinâmicas)
├── components.json             # Configuração do Shadcn UI
├── tailwind.config.ts          # Configurações de tema se necessárias (Tailwind v4 gerencia no CSS)
└── package.json                # Gerenciamento de dependências e scripts do projeto
```

---

## 🔐 Autenticação & Fluxo de Usuários

O sistema possui um fluxo de autenticação local persistido no `localStorage`:
1. **Redirecionamento:** A raiz `src/app/page.tsx` verifica se o usuário está logado usando o `useAuth()`.
   - Se logado -> redireciona para `/dashboard`.
   - Se deslogado -> redireciona para `/login`.
2. **Contas de Teste Pré-existentes:**
   - **Lucas Tas:** `lucas.tas@live.com` / Senha: `lucas123` (Administrador)
   - **Dálete Achei:** `dalete.achei@hotmail.com` / Senha: `dalete123` (Administrador)
3. **Novos Cadastros:** O formulário de cadastro na tela de login adiciona novos usuários com a role padrão `Funcionário`.

---

## 💾 Armazenamento de Dados (Banco de Dados Mock)

Toda a persistência é simulada localmente via `src/lib/mockDb.ts`, salvando os dados no `localStorage` do navegador para manter o estado persistido após reloads da página:
- **Usuários (`db_users`):** Lista de pessoas com acesso.
- **Clientes (`db_clients`):** Clientes ativos, pausados ou cancelados.
- **Leads (`db_leads`):** Oportunidades comerciais (funil de vendas/CRM).
- **Transações (`db_transactions`):** Histórico de fluxo de caixa (receitas e despesas).

---

## 📊 Módulos do Dashboard (`src/app/dashboard/page.tsx`)

O dashboard é uma interface unificada dividida em abas/seções gerenciadas pelo estado da página:
1. **Visão Geral (Home):** Resumo geral de métricas (faturamento mensal, clientes ativos, leads no funil, etc.) e gráficos de fluxo de caixa recentes.
2. **Clientes:** Listagem de empresas atendidas, status de contrato, valor mensal e data de início. Permite criar, editar e excluir registros.
3. **CRM / Leads:** Funil de vendas organizado por estágios (`Novo`, `Em Contato`, `Proposta`, `Ganho`, `Perdido`). Permite mover leads entre etapas e salvar notas de negociação.
4. **Financeiro:** Extrato de receitas e despesas, saldo acumulado e gráficos de despesas vs. receitas por categoria.

---

## 🛠️ Como rodar o projeto localmente

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
3. Abra [http://localhost:3000](http://localhost:3000) no seu navegador.
