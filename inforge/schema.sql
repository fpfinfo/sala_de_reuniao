-- ============================================================================
-- SCHEMA & TABELAS DO BANCO DE DADOS: GESTÃO DE SALAS SEPLAN (TJPA / INFORGE)
-- ============================================================================

-- Habilita extensão de UUID e Btree_gist para suporte a restrição de exclusão temporal
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- ----------------------------------------------------------------------------
-- 1. TABELA DE SALAS (ROOMS)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    capacity INT NOT NULL DEFAULT 10,
    location VARCHAR(150) NOT NULL DEFAULT 'SEPLAN - Prédio Sede',
    description TEXT,
    color VARCHAR(20) DEFAULT '#002B5C',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 2. TABELA DE AGENDAMENTOS (BOOKINGS)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    user_name VARCHAR(150) NOT NULL,
    user_email VARCHAR(150) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'CONFIRMED' CHECK (status IN ('CONFIRMED', 'CANCELLED')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Validação de coerência cronológica
    CONSTRAINT chk_booking_cronologia CHECK (end_time > start_time)
);

-- ----------------------------------------------------------------------------
-- 3. CONSTRAINT DE EXCLUSÃO PARA IMPEDIR SOBREPOSIÇÃO DE HORÁRIOS NA MESMA SALA
-- Impede atomicamente colisões no PostgreSQL para reservas CONFIRMADAS
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

-- Índices de consulta rápida
CREATE INDEX IF NOT EXISTS idx_bookings_date_search ON bookings (room_id, start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings (user_id);

-- ----------------------------------------------------------------------------
-- 4. SEED INICIAL DAS 3 SALAS DA SEPLAN
-- ----------------------------------------------------------------------------
INSERT INTO rooms (id, name, capacity, location, description, color) VALUES
('a1111111-1111-1111-1111-111111111111', 'Sala de Reunião 1 (Executiva)', 12, 'SEPLAN - Ala A (Prédio Sede)', 'Sala executiva com mesa de 12 lugares, TV 65" 4K para videoconferências e quadro branco de vidro.', '#002B5C'),
('a2222222-2222-2222-2222-222222222222', 'Sala de Reunião 2 (Técnica)', 8, 'SEPLAN - Ala B (Planejamento)', 'Ambiente focado em alinhamentos técnicos e revisões orçamentárias, mesa redonda para 8 pessoas.', '#059669'),
('a3333333-3333-3333-3333-333333333333', 'Sala de Reunião 3 (Plenária / Brainstorming)', 16, 'SEPLAN - Ala Central', 'Espaço amplo com layout modular, projetor laser de alta definição e sistema de som.', '#C59B27')
ON CONFLICT (id) DO NOTHING;

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

CREATE TRIGGER trigger_update_bookings_timestamp
BEFORE UPDATE ON bookings
FOR EACH ROW
EXECUTE FUNCTION update_timestamp_column();
