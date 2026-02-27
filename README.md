# Creo AI Studio Internal OS

A comprehensive internal operating system for managing clients, projects, finances, and documents.

## Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4 + ShadCN UI
- **Rich Text**: TipTap (Block-based editor)
- **Backend**: Insforge SDK (Pre-configured)
- **PDF Generation**: jsPDF

## Features Implemented (Phase 1 & 2)
- **Executive Dashboard**: Real-time revenue, profit, and project metrics with interactive charts.
- **Client Management**: Structured database for clients with derived profitability fields.
- **Project Management**: 40/60 payment split logic, progress tracking, and category-wise grouping.
- **Finance Intelligence**: Margin analysis, service-line profitability, and cycle time metrics.
- **Rich Text Requirements**: Notion-style editor for project scope and client notes.
- **Document Hub**: Central repository for contracts and project artifacts.
- **Invoice Generator**: One-click professional PDF generation for project payments.

## Setup Instructions

### 1. Environment Variables
Create a `.env.local` file in the `creo-os` directory:
```env
NEXT_PUBLIC_INSFORGE_URL=your_insforge_backend_url
NEXT_PUBLIC_INSFORGE_ANON_KEY=your_insforge_anon_key
```

### 2. Development
```bash
cd creo-os
npm install
npm run dev
```

### 3. Role-Based Access
The system is designed with roles in mind (Admin, Operations, Finance, Viewer). 
- Financial and credential fields are prepared for role-protection.
- Use the `hasRole` utility in `src/lib/insforge.ts` to gating UI components.

## Success Metrics Tracked
- **Profit visibility**: Instant margin calculation on every project.
- **Payment tracking**: Visual alerts for pending advance/final payments.
- **Cycle time**: Tracking from first meeting to final payment.
- **Service Performance**: Profitability breakdown by category (AI Workflows, Websites, etc.)
