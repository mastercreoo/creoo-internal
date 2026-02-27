export type Role = 'admin' | 'operations' | 'finance' | 'viewer';

export interface User {
    id: string;
    email: string;
    name: string;
    role: Role;
}

export type ProjectStatus = 'lead' | 'active' | 'completed' | 'paused';
export type ClientStatus = 'active' | 'completed' | 'paused';
export type ServiceCategory = 'website' | 'ai_workflow' | 'automation' | 'management';

export interface Client {
    id: string;
    client_name: string;
    company_name: string;
    contact_email: string;
    phone: string;
    industry: string;
    lead_source: string;
    contract_start_date: string;
    contract_end_date: string;
    renewal_date: string;
    payment_structure: string; // Default: '40/60'
    status: ClientStatus;

    // Derived
    total_revenue?: number;
    total_cost?: number;
    total_profit?: number;
    total_margin_percent?: number;
}

export interface Project {
    id: string;
    client_id: string;
    service_category: ServiceCategory;
    project_name: string;
    price_total: number;
    advance_required: number;
    final_required: number;
    advance_paid: boolean;
    final_paid: boolean;
    advance_paid_date?: string;
    final_paid_date?: string;
    first_meeting_date: string;
    contract_signed_date?: string;
    build_start_date?: string;
    go_live_date?: string;
    final_payment_date?: string;
    deadline: string;
    status: ProjectStatus;

    // Derived
    cycle_time_days?: number;
    profit?: number;
    margin_percent?: number;
}

export type CostEntryType = 'labor' | 'tool' | 'hosting' | 'api' | 'other';

export interface CostEntry {
    id: string;
    project_id: string;
    type: CostEntryType;
    description: string;
    estimated_cost: number;
    actual_cost: number;
    hours_spent: number;
    hourly_rate: number;
}

export interface Credential {
    id: string;
    client_id: string;
    service_name: string;
    username: string;
    password_encrypted: string;
}

export interface Invoice {
    id: string;
    project_id: string;
    client_id: string;
    amount: number;
    status: 'pending' | 'paid' | 'overdue';
    due_date: string;
    invoice_number: string;
}
