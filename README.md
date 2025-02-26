<div align="center">
  <h1>Book Fair Manager</h1>
  <p><strong>Sistema completo de gerenciamento para feiras de livros</strong></p>
  
  ![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)
  ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
  ![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
  ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
  ![TailwindCSS](https://img.shields.io/badge/TailwindCSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
  ![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
</div>

![Book Fair Dashboard](https://via.placeholder.com/1200x630/0A2540/FFFFFF?text=Book+Fair+Manager+Dashboard)

> **Desenvolvido com tecnologias modernas, este sistema oferece controle total sobre o ciclo de vida de uma feira de livros: do cadastro e gestão de estoque ao controle financeiro, vendas, trocas e relatórios.**

## 📑 Índice

- [✨ Visão Geral](#-visão-geral)
- [🚀 Recursos e Funcionalidades](#-recursos-e-funcionalidades)
- [🛠️ Stack Tecnológica](#️-stack-tecnológica)
- [🔧 Configuração e Instalação](#-configuração-e-instalação)
- [📱 Responsividade](#-responsividade)
- [🌟 Roadmap e Recursos Futuros](#-roadmap-e-recursos-futuros)
- [📚 Documentação](#-documentação)
- [👥 Autor](#-autor)

## ✨ Visão Geral

O **Book Fair Manager** é uma aplicação web completa para organizações que realizam feiras de livros, com foco especial em feiras de livros. O sistema gerencia todo o ciclo operacional:

1. 📚 **Gerenciamento de Livros** - Cadastro detalhado com código, autor, editora e outros campos
2. 💰 **Controle de Caixa** - Gestão financeira com abertura, fechamento e relatórios
3. 🛒 **Vendas e Trocas** - Interface intuitiva para operações de vendas e devoluções
4. 📊 **Relatórios Analíticos** - Dados completos de desempenho e vendas

### Fluxo de Trabalho

```mermaid
graph TD
    A[Cadastro de Livros] -->|Estoque| B(Abertura de Caixa)
    B --> C{Operações}
    C -->|Venda| D[Processamento de Pagamento]
    C -->|Troca| E[Registro de Devolução/Troca]
    C -->|Consulta| F[Terminal de Busca]
    D --> G[Atualização de Estoque]
    E --> G
    G --> H[Fechamento de Caixa]
    H --> I[Relatórios e Análises]
```

O sistema oferece uma interface administrativa completa onde gestores podem monitorar o estoque, acompanhar vendas, gerenciar operações financeiras e extrair relatórios detalhados para tomada de decisões.

## 🚀 Recursos e Funcionalidades

<table>
  <tr>
    <td width="50%">
      <h3>📚 Gerenciamento de Livros</h3>
      <ul>
        <li>Cadastro completo com código FLE único</li>
        <li>Controle de estoque automático</li>
        <li>Importação em massa via Excel</li>
        <li>Busca por título, autor, código ou assunto</li>
      </ul>
    </td>
    <td width="50%">
      <h3>🛒 Sistema de Vendas</h3>
      <ul>
        <li>Interface otimizada para operação rápida</li>
        <li>Suporte para leitor de código de barras</li>
        <li>Múltiplas formas de pagamento</li>
        <li>Cálculo automático de troco</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h3>💰 Gestão de Caixa</h3>
      <ul>
        <li>Abertura e fechamento com balanço</li>
        <li>Registro de retiradas com justificativa</li>
        <li>Extrato detalhado de movimentações</li>
        <li>Relatórios por período</li>
      </ul>
    </td>
    <td width="50%">
      <h3>🔄 Trocas e Devoluções</h3>
      <ul>
        <li>Processo intuitivo de devolução</li>
        <li>Cálculo automático de diferença de valores</li>
        <li>Rastreabilidade completa</li>
        <li>Atualização automática do estoque</li>
      </ul>
    </td>
  </tr>
</table>

### Recursos Adicionais

- **Terminal de Consulta**: Interface específica para visitantes
- **Dashboard Interativo**: Visão consolidada de métricas e desempenho
- **Relatórios em PDF**: Exportação de relatórios detalhados
- **Operadores**: Controle de quem realizou cada operação

## 🛠️ Stack Tecnológica

<table>
  <tr>
    <th>Categoria</th>
    <th>Tecnologias</th>
    <th>Propósito</th>
  </tr>
  <tr>
    <td><strong>Frontend</strong></td>
    <td>
      <img src="https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=next.js&logoColor=white" alt="Next.js" />
      <img src="https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React" />
      <img src="https://img.shields.io/badge/TailwindCSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="TailwindCSS" />
      <img src="https://img.shields.io/badge/shadcn/ui-000000?style=flat-square&logo=shadcnui&logoColor=white" alt="shadcn/ui" />
    </td>
    <td>Interface responsiva, componentizada e de alta performance com server-side rendering e otimização automática.</td>
  </tr>
  <tr>
    <td><strong>Backend</strong></td>
    <td>
      <img src="https://img.shields.io/badge/Next.js_API-000000?style=flat-square&logo=next.js&logoColor=white" alt="Next.js API" />
      <img src="https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white" alt="Node.js" />
    </td>
    <td>API Routes do Next.js para endpoints serverless com Node.js, eliminando a necessidade de um servidor separado.</td>
  </tr>
  <tr>
    <td><strong>Database</strong></td>
    <td>
      <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white" alt="PostgreSQL" />
      <img src="https://img.shields.io/badge/Prisma-2D3748?style=flat-square&logo=prisma&logoColor=white" alt="Prisma" />
    </td>
    <td>Database relacional robusto com ORM moderno que fornece type-safety e migrations automatizadas.</td>
  </tr>
  <tr>
    <td><strong>Visualização</strong></td>
    <td>
      <img src="https://img.shields.io/badge/Recharts-22B5BF?style=flat-square&logo=recharts&logoColor=white" alt="Recharts" />
      <img src="https://img.shields.io/badge/React_PDF-EC5990?style=flat-square&logo=reacthookform&logoColor=white" alt="React PDF" />
    </td>
    <td>Gráficos interativos para dashboard e geração de relatórios em PDF com layout profissional.</td>
  </tr>
  <tr>
    <td><strong>DevOps</strong></td>
    <td>
      <img src="https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white" alt="Docker" />
      <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
    </td>
    <td>Containerização para ambiente de desenvolvimento consistente e tipagem estática para código mais seguro.</td>
  </tr>
  <tr>
    <td><strong>Ferramentas</strong></td>
    <td>
      <img src="https://img.shields.io/badge/React_Hook_Form-EC5990?style=flat-square&logo=react-hook-form&logoColor=white" alt="React Hook Form" />
      <img src="https://img.shields.io/badge/React_Query-FF4154?style=flat-square&logo=react-query&logoColor=white" alt="React Query" />
      <img src="https://img.shields.io/badge/Zod-3E67B1?style=flat-square&logo=zod&logoColor=white" alt="Zod" />
      <img src="https://img.shields.io/badge/XLSX-217346?style=flat-square&logo=microsoftexcel&logoColor=white" alt="XLSX" />
    </td>
    <td>Bibliotecas especializadas para manipulação de formulários, gerenciamento de estado, validação e processamento de planilhas.</td>
  </tr>
</table>

### 🏗️ Arquitetura

A aplicação segue uma arquitetura moderna baseada no App Router do Next.js:

```
book-fair-manager/
├── app/                  # Rotas e páginas da aplicação
│   ├── (portal)/         # Interface administrativa
│   │   ├── books/        # Gestão de livros
│   │   ├── cash/         # Controle de caixa
│   │   ├── dashboard/    # Painel principal
│   │   ├── relatorios/   # Relatórios
│   │   ├── transactions/ # Vendas e trocas
│   │   └── vendas/       # Ponto de venda
│   ├── api/              # API endpoints
├── components/           # Componentes React reutilizáveis
│   ├── ui/               # Componentes de interface básicos
│   └── terminal/         # Componentes do terminal de consulta
├── hooks/                # Custom React hooks
├── lib/                  # Serviços e utilitários
├── prisma/               # Schema e migrations do banco
├── public/               # Arquivos estáticos
└── types/                # Definições de tipos TypeScript
```

Este projeto implementa:

- **Clean Architecture** - Separação clara de responsabilidades
- **Componentes Reutilizáveis** - Design system consistente
- **Type Safety** - TypeScript em todas as camadas da aplicação
- **API RESTful** - Endpoints bem definidos para operações CRUD

## 🔧 Configuração e Instalação

### Pré-requisitos

- Node.js 18.x ou superior
- PostgreSQL 14.x ou superior
- Docker e Docker Compose (opcional)

### Instalação

1. **Clone o repositório**

```bash
git clone https://github.com/seu-usuario/book-fair-manager.git
cd book-fair-manager
```

2. **Instale as dependências**

```bash
npm install
# ou
yarn
```

3. **Configure as variáveis de ambiente**

Crie um arquivo `.env` na raiz do projeto:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/book_fair"
```

4. **Inicie o banco de dados com Docker (opcional)**

```bash
docker-compose up -d
```

5. **Execute as migrações do Prisma**

```bash
npx prisma migrate dev
```

6. **Inicie o servidor de desenvolvimento**

```bash
npm run dev
# ou
yarn dev
```

7. **Acesse a aplicação**

Abra o navegador e acesse `http://localhost:3000`

### Estrutura do Banco de Dados

O sistema utiliza as seguintes tabelas principais:

- `Book` - Catálogo de livros com detalhes e estoque
- `Transaction` - Registro de vendas e trocas
- `CashRegister` - Controle de abertura e fechamento de caixa
- `Payment` - Pagamentos associados às transações
- `Operator` - Usuários operadores do sistema
- `CashWithdrawal` - Registro de retiradas de caixa

## 📱 Responsividade

A aplicação foi desenvolvida com design responsivo completo, funcionando perfeitamente em:

- 💻 Desktops
- 💻 Laptops
- 📱 Tablets
- 📱 Smartphones

## 🌟 Roadmap e Recursos Futuros

Funcionalidades planejadas para as próximas versões:

- **Sistema de Autenticação**: Controle de acesso baseado em perfis de usuários
- **Modo Offline**: Operação sem conexão com sincronização posterior
- **App Mobile**: Versão nativa para Android e iOS
- **Integração com E-commerce**: Para vendas online
- **Múltiplas Unidades**: Suporte para feiras em diferentes locais simultaneamente

## 📚 Documentação

Documentação detalhada está disponível nos seguintes arquivos:

- [Funcionalidades](FEATURES.md) - Descrição detalhada dos recursos
- [Contribuindo](CONTRIBUTING.md) - Guia para desenvolvedores

## 👥 Autor

Desenvolvido por Daniel Moura para a FLE.
