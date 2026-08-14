-- ============================================================================
-- SCHEMA & TABELAS DO BANCO DE DADOS: GESTÃO DE SALAS SEPLAN (TJPA / INFORGE)
-- ============================================================================

-- Habilita extensões essenciais
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- ----------------------------------------------------------------------------
-- 1. TABELA DE USUÁRIOS (USERS & RBAC)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'USER' CHECK (role IN ('MASTER_ADMIN', 'ADMIN', 'USER')),
    department VARCHAR(150) DEFAULT 'SEPLAN',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed de Usuários Iniciais
INSERT INTO users (id, name, email, role, department) VALUES
('b1111111-1111-1111-1111-111111111111', 'Fabio Freitas', 'fabio.freitas@tjpa.jus.br', 'MASTER_ADMIN', 'Gabinete da Secretaria (SEPLAN)'),
('b2222222-2222-2222-2222-222222222222', 'Coordenadoria de Planejamento', 'planejamento@tjpa.jus.br', 'ADMIN', 'SEPLAN / Planejamento'),
('b3333333-3333-3333-3333-333333333333', 'Servidor Finanças', 'servidor.financas@tjpa.jus.br', 'USER', 'COFIN / Coordenação Financeira'),
('b4444444-4444-4444-4444-444444444444', 'Servidor Arrecadação', 'servidor.arrecadacao@tjpa.jus.br', 'USER', 'CODAR / Arrecadação')
ON CONFLICT (email) DO UPDATE SET role = EXCLUDED.role, department = EXCLUDED.department;

-- ----------------------------------------------------------------------------
-- 2. TABELA DE SALAS (ROOMS)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    capacity INT NOT NULL,
    location VARCHAR(150) NOT NULL DEFAULT 'SEPLAN - Prédio Sede',
    description TEXT,
    color VARCHAR(20) DEFAULT '#002B5C',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed das 3 Salas da SEPLAN com Capacidades Atualizadas
INSERT INTO rooms (id, name, capacity, location, description, color) VALUES
('a1111111-1111-1111-1111-111111111111', 'Sala de Reunião 1 (CODAR)', 10, 'SEPLAN - Ala CODAR (Prédio Sede)', 'Sala de reuniões da Coordenadoria de Arrecadação (CODAR) equipada com TV 65" 4K para videoconferências e quadro branco.', '#002B5C'),
('a2222222-2222-2222-2222-222222222222', 'Sala de Reunião 2 (SEPLAN)', 15, 'SEPLAN - Gabinete / Planejamento', 'Sala central da Secretaria de Planejamento, Coordenação e Finanças para alinhamentos estratégicos com o Secretário Geral e equipes.', '#059669'),
('a3333333-3333-3333-3333-333333333333', 'Sala de Reunião 3 (COFIN)', 15, 'SEPLAN - Ala COFIN (Finanças)', 'Espaço da Coordenadoria Financeira (COFIN) com layout amplo, projetor de alta definição e sistema integrado de áudio.', '#C59B27')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, capacity = EXCLUDED.capacity, location = EXCLUDED.location, description = EXCLUDED.description;

-- ----------------------------------------------------------------------------
-- 3. TABELA DE AGENDAMENTOS (BOOKINGS COM WORKFLOW DE APROVAÇÃO)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_name VARCHAR(150) NOT NULL,
    user_email VARCHAR(150) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED', 'REJECTED', 'CANCELLED')),
    is_priority BOOLEAN DEFAULT FALSE,
    rejection_reason TEXT,
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Validação de coerência cronológica
    CONSTRAINT chk_booking_cronologia CHECK (end_time > start_time)
);

-- ----------------------------------------------------------------------------
-- 4. CONSTRAINT DE EXCLUSÃO PARA RESERVAS CONFIRMADAS NA MESMA SALA
-- Impede atomicamente colisões temporais para reservas confirmadas
-- ----------------------------------------------------------------------------
ALTER TABLE bookings 
DROP CONSTRAINT IF EXISTS exclude_room_booking_collision;

ALTER TABLE bookings 
ADD CONSTRAINT exclude_room_booking_collision 
EXCLUDE USING gist (
    room_id WITH =,
    tstzrange(start_time, end_time) WITH &&
)
WHERE (status = 'CONFIRMED');

-- Índices de busca otimizada
CREATE INDEX IF NOT EXISTS idx_bookings_date_status ON bookings (room_id, start_time, end_time, status);
CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings (user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_pending ON bookings (status) WHERE status = 'PENDING';

-- ----------------------------------------------------------------------------
-- 5. FUNCTION & TRIGGER PARA ATUALIZAÇÃO AUTOMÁTICA DE UPDATED_AT
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_timestamp_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trigger_update_bookings_timestamp ON bookings;
CREATE TRIGGER trigger_update_bookings_timestamp
BEFORE UPDATE ON bookings
FOR EACH ROW
EXECUTE FUNCTION update_timestamp_column();
