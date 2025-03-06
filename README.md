<div align="center">
  <h1>Book Fair Manager</h1>
  <p><strong>Complete management system for book fairs</strong></p>
  
  ![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)
  ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
  ![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
  ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
  ![TailwindCSS](https://img.shields.io/badge/TailwindCSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
  ![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
</div>

> **Developed with modern technologies, this system offers complete control over the lifecycle of a book fair: from registration and inventory management to financial control, sales, exchanges, and reports.**

## 📑 Table of Contents

- [✨ Overview](#-overview)
- [🚀 Features and Functionality](#-features-and-functionality)
- [🛠️ Technology Stack](#️-technology-stack)
- [🔧 Configuration and Installation](#-configuration-and-installation)
- [📱 Responsiveness](#-responsiveness)
- [🌟 Roadmap and Future Features](#-roadmap-and-future-features)
- [📚 Documentation](#-documentation)
- [👥 Author](#-author)

## ✨ Overview

**Book Fair Manager** is a complete web application for organizations that hold book fairs, with a special focus on book fairs. The system manages the entire operational cycle:

1. 📚 **Book Management** - Detailed registration with code, author, publisher, and other fields
2. 💰 **Cash Control** - Financial management with opening, closing, and reports
3. 🛒 **Sales and Exchanges** - Intuitive interface for sales and return operations
4. 📊 **Analytical Reports** - Complete performance and sales data

### Workflow

```mermaid
graph TD
    A[Book Registration] -->|Inventory| B(Cash Register Opening)
    B --> C{Operations}
    C -->|Sale| D[Payment Processing]
    C -->|Exchange| E[Return/Exchange Registration]
    C -->|Query| F[Search Terminal]
    D --> G[Inventory Update]
    E --> G
    G --> H[Cash Register Closing]
    H --> I[Reports and Analysis]
```

The system offers a complete administrative interface where managers can monitor inventory, track sales, manage financial operations, and extract detailed reports for decision-making.

## 🚀 Features and Functionality

<table>
  <tr>
    <td width="50%">
      <h3>📚 Book Management</h3>
      <ul>
        <li>Complete registration with unique FLE code</li>
        <li>Automatic inventory control</li>
        <li>Bulk import via Excel</li>
        <li>Search by title, author, code, or subject</li>
      </ul>
    </td>
    <td width="50%">
      <h3>🛒 Sales System</h3>
      <ul>
        <li>Optimized interface for fast operation</li>
        <li>Barcode reader support</li>
        <li>Multiple payment methods</li>
        <li>Automatic change calculation</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h3>💰 Cash Management</h3>
      <ul>
        <li>Opening and closing with balance</li>
        <li>Withdrawal recording with justification</li>
        <li>Detailed transaction statement</li>
        <li>Reports by period</li>
      </ul>
    </td>
    <td width="50%">
      <h3>🔄 Exchanges and Returns</h3>
      <ul>
        <li>Intuitive return process</li>
        <li>Automatic calculation of value differences</li>
        <li>Complete traceability</li>
        <li>Automatic inventory update</li>
      </ul>
    </td>
  </tr>
</table>

### Additional Features

- **Query Terminal**: Specific interface for visitors
- **Interactive Dashboard**: Consolidated view of metrics and performance
- **PDF Reports**: Exportation of detailed reports
- **Operators**: Control of who performed each operation

## 🛠️ Technology Stack

<table>
  <tr>
    <th>Category</th>
    <th>Technologies</th>
    <th>Purpose</th>
  </tr>
  <tr>
    <td><strong>Frontend</strong></td>
    <td>
      <img src="https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=next.js&logoColor=white" alt="Next.js" />
      <img src="https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React" />
      <img src="https://img.shields.io/badge/TailwindCSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="TailwindCSS" />
      <img src="https://img.shields.io/badge/shadcn/ui-000000?style=flat-square&logo=shadcnui&logoColor=white" alt="shadcn/ui" />
    </td>
    <td>Responsive, componentized, and high-performance interface with server-side rendering and automatic optimization.</td>
  </tr>
  <tr>
    <td><strong>Backend</strong></td>
    <td>
      <img src="https://img.shields.io/badge/Next.js_API-000000?style=flat-square&logo=next.js&logoColor=white" alt="Next.js API" />
      <img src="https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white" alt="Node.js" />
    </td>
    <td>Next.js API Routes for serverless endpoints with Node.js, eliminating the need for a separate server.</td>
  </tr>
  <tr>
    <td><strong>Database</strong></td>
    <td>
      <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white" alt="PostgreSQL" />
      <img src="https://img.shields.io/badge/Prisma-2D3748?style=flat-square&logo=prisma&logoColor=white" alt="Prisma" />
    </td>
    <td>Robust relational database with a modern ORM that provides type-safety and automated migrations.</td>
  </tr>
  <tr>
    <td><strong>Visualization</strong></td>
    <td>
      <img src="https://img.shields.io/badge/Recharts-22B5BF?style=flat-square&logo=recharts&logoColor=white" alt="Recharts" />
      <img src="https://img.shields.io/badge/React_PDF-EC5990?style=flat-square&logo=reacthookform&logoColor=white" alt="React PDF" />
    </td>
    <td>Interactive charts for dashboard and generation of PDF reports with professional layout.</td>
  </tr>
  <tr>
    <td><strong>DevOps</strong></td>
    <td>
      <img src="https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white" alt="Docker" />
      <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
    </td>
    <td>Containerization for consistent development environment and static typing for safer code.</td>
  </tr>
  <tr>
    <td><strong>Tools</strong></td>
    <td>
      <img src="https://img.shields.io/badge/React_Hook_Form-EC5990?style=flat-square&logo=react-hook-form&logoColor=white" alt="React Hook Form" />
      <img src="https://img.shields.io/badge/React_Query-FF4154?style=flat-square&logo=react-query&logoColor=white" alt="React Query" />
      <img src="https://img.shields.io/badge/Zod-3E67B1?style=flat-square&logo=zod&logoColor=white" alt="Zod" />
      <img src="https://img.shields.io/badge/XLSX-217346?style=flat-square&logo=microsoftexcel&logoColor=white" alt="XLSX" />
    </td>
    <td>Specialized libraries for form handling, state management, validation, and spreadsheet processing.</td>
  </tr>
</table>

### 🏗️ Architecture

The application follows a modern architecture based on Next.js App Router:

```
book-fair-manager/
├── app/                  # Application routes and pages
│   ├── (portal)/         # Administrative interface
│   │   ├── books/        # Book management
│   │   ├── cash/         # Cash control
│   │   ├── dashboard/    # Main dashboard
│   │   ├── relatorios/   # Reports
│   │   ├── transactions/ # Sales and exchanges
│   │   └── vendas/       # Point of sale
│   ├── api/              # API endpoints
├── components/           # Reusable React components
│   ├── ui/               # Basic interface components
│   └── terminal/         # Query terminal components
├── hooks/                # Custom React hooks
├── lib/                  # Services and utilities
├── prisma/               # Database schema and migrations
├── public/               # Static files
└── types/                # TypeScript type definitions
```

This project implements:

- **Clean Architecture** - Clear separation of responsibilities
- **Reusable Components** - Consistent design system
- **Type Safety** - TypeScript in all layers of the application
- **RESTful API** - Well-defined endpoints for CRUD operations

## 🔧 Configuration and Installation

### Prerequisites

- Node.js 18.x or higher
- PostgreSQL 14.x or higher
- Docker and Docker Compose (optional)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/your-username/book-fair-manager.git
cd book-fair-manager
```

2. **Install dependencies**

```bash
npm install
# or
yarn
```

3. **Configure environment variables**

Create a `.env` file in the project root:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/book_fair"
```

4. **Start the database with Docker (optional)**

```bash
docker-compose up -d
```

5. **Run Prisma migrations**

```bash
npx prisma migrate dev
```

6. **Start the development server**

```bash
npm run dev
# or
yarn dev
```

7. **Access the application**

Open your browser and access `http://localhost:3000`

### Database Structure

The system uses the following main tables:

- `Book` - Book catalog with details and inventory
- `Transaction` - Record of sales and exchanges
- `CashRegister` - Control of cash register opening and closing
- `Payment` - Payments associated with transactions
- `Operator` - System operator users
- `CashWithdrawal` - Record of cash withdrawals

## 📱 Responsiveness

The application was developed with complete responsive design, working perfectly on:

- 💻 Desktops
- 💻 Laptops
- 📱 Tablets
- 📱 Smartphones

## 🌟 Roadmap and Future Features

Features planned for upcoming versions:

- **Authentication System**: Access control based on user profiles
- **Offline Mode**: Operation without connection with later synchronization
- **Mobile App**: Native version for Android and iOS
- **E-commerce Integration**: For online sales
- **Multiple Units**: Support for fairs in different locations simultaneously

## 📚 Documentation

Detailed documentation is available in the following files:

- [Features](FEATURES.md) - Detailed description of features

## 👥 Author

Developed by Daniel Moura for FLE.
