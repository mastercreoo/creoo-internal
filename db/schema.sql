-- Creo OS Database Schema
-- Run this in your InsForge dashboard under Database > SQL Editor

-- ============================================================
-- USERS TABLE
-- Stores internal team members who can log into the portal
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  email       TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role        TEXT NOT NULL DEFAULT 'admin',
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- CLIENTS TABLE
-- Stores all client accounts managed by Creo AI Studio
-- ============================================================
CREATE TABLE IF NOT EXISTS clients (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name          TEXT NOT NULL,
  company_name         TEXT,
  contact_email        TEXT,
  phone                TEXT,
  industry             TEXT,
  lead_source          TEXT,
  contract_start_date  DATE,
  contract_end_date    DATE,
  renewal_date         DATE,
  payment_structure    TEXT DEFAULT '40/60',
  status               TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  created_at           TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- PROJECTS TABLE
-- Stores individual projects per client
-- ============================================================
CREATE TABLE IF NOT EXISTS projects (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id           UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  title               TEXT NOT NULL,
  service_type        TEXT NOT NULL DEFAULT 'website' CHECK (service_type IN ('website', 'ai_workflow', 'automation', 'management')),
  price               NUMERIC(12, 2) NOT NULL DEFAULT 0,
  status              TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('lead', 'active', 'completed', 'paused')),
  start_date          DATE,
  deadline            DATE,
  final_payment_date  DATE,
  created_at          TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- PAYMENTS TABLE
-- Tracks advance (40%) and final (60%) payments per project
-- ============================================================
CREATE TABLE IF NOT EXISTS payments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  type        TEXT NOT NULL CHECK (type IN ('advance', 'final')),
  amount      NUMERIC(12, 2) NOT NULL DEFAULT 0,
  status      TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('paid', 'pending')),
  paid_date   TIMESTAMPTZ
);

-- ============================================================
-- COSTS TABLE
-- Tracks cost entries per project (labor, tools, hosting, other)
-- ============================================================
CREATE TABLE IF NOT EXISTS costs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id    UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  labor_cost    NUMERIC(12, 2) NOT NULL DEFAULT 0,
  tool_cost     NUMERIC(12, 2) NOT NULL DEFAULT 0,
  hosting_cost  NUMERIC(12, 2) NOT NULL DEFAULT 0,
  other_cost    NUMERIC(12, 2) NOT NULL DEFAULT 0
);

-- ============================================================
-- SEED: Create default admin user
-- Password: "admin123" (bcrypt hash with 10 rounds)
-- ⚠️  IMPORTANT: Change this password immediately after first login!
-- To generate a new hash: use the Node.js script in scripts/gen-hash.js
-- ============================================================
INSERT INTO users (name, email, password_hash, role)
VALUES ('Admin User', 'admin@creoai.studio', '$2a$10$slYQmyNdGzin7olVCRjKKOL.LRphJEJl3dxPr1F7qNZdJK3u.4OEO', 'admin')
ON CONFLICT (email) DO NOTHING;
