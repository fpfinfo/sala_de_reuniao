# Especificação Técnica de Design: Gestão de Agendamento de Salas de Reunião - SEPLAN

## 1. Visão Geral do Sistema
O sistema de **Gestão de Agendamento de Salas de Reunião para a SEPLAN** é uma aplicação web moderna, responsiva e de alta performance desenvolvida em React (TypeScript) com Tailwind CSS no frontend e integrada ao backend Inforge via cliente REST com autenticação JWT.

A aplicação atende ao gerenciamento das 3 salas de reuniões da SEPLAN, oferecendo:
- Visualização em grade horária diária das 3 salas lado a lado.
- Workflow de Aprovação Institucional com perfis de acesso (`MASTER_ADMIN`, `ADMIN`, `USER`).
- **Prioridade do Gabinete do Secretário de Planejamento**: Solicitações de usuários entram como `PENDING` (Pendente de Aprovação) para que o Administrador possa avaliar ou priorizar horários do Secretário Geral.
- Gestão de Administradores delegada pelo **Administrador Master (`fabio.freitas@tjpa.jus.br`)**.
- Validação antecipada e atômica contra conflitos de horário.

---

## 2. Requisitos do Sistema

### 2.1 Requisitos Funcionais (RF)
- **RF01 - Autenticação & Perfis de Acesso (RBAC)**:
  - `MASTER_ADMIN` (`fabio.freitas@tjpa.jus.br`): Acesso total, aprovação/rejeição de reservas, agendamento prioritário e concessão de perfil `ADMIN` para outros servidores.
  - `ADMIN`: Aprovação e rejeição de solicitações pendentes, agendamento prioritário do Gabinete/Secretário.
  - `USER`: Criação de solicitações de reserva (nascem com status `PENDING`), visualização da grade e cancelamento de suas próprias solicitações.
- **RF02 - Visualização de Salas e Grade Diária**:
  - 🔵 **Sala de Reunião 1 (CODAR)**: **10 lugares** (`#002B5C`) — Ala CODAR (Prédio Sede).
  - 🟢 **Sala de Reunião 2 (SEPLAN)**: **15 lugares** (`#059669`) — Gabinete / Planejamento.
  - 🟡 **Sala de Reunião 3 (COFIN)**: **15 lugares** (`#C59B27`) — Ala COFIN (Finanças).
  - Distinção visual: Reuniões confirmadas com cor sólida da sala; reuniões pendentes com contorno tracejado e badge âmbar; reuniões prioritárias do Gabinete com selo dourado.
- **RF03 - Painel de Aprovações (Exclusivo Admin)**:
  - Fila de agendamentos pendentes com aprovação rápida em 1 clique (`CONFIRMED`) ou rejeição com justificativa (`REJECTED`).
- **RF04 - Agendamento Prioritário do Gabinete / Secretário**:
  - Administradores podem marcar a flag de "Prioridade do Gabinete/Secretário", confirmando o horário imediatamente e rejeitando eventuais pedidos conflitantes com justificativa automática.
- **RF05 - Gestão de Usuários e Administradores**:
  - O Administrador Master pode listar os usuários cadastrados e alternar suas permissões entre `USER` e `ADMIN`.
- **RF06 - Meus Agendamentos & Cancelamento**: Painel listando o status em tempo real de cada solicitação (Pendente, Confirmada, Rejeitada, Cancelada).

### 2.2 Requisitos Não Funcionais (RNF)
- **RNF01 - Identidade Visual Institucional SEPLAN/TJPA**:
  - **Azul Marinho TJPA (`#002B5C`)**: Headers, botões principais corporativos e Sala 1.
  - **Dourado/Ouro (`#C59B27`)**: Acentos, botão de Novo Agendamento, badges de prioridade e Sala 3.
  - **Cinza Claro (`#F1F3F6`)**: Fundo geral e containers neutros.
  - **Vermelho Alerta (`#ED1C24`)**: Cancelamentos, recusas e alertas de colisão.
  - **Branco Puro (`#FFFFFF`)**: Superfície dos cartões e modais.
- **RNF02 - Resiliência e Offline/Mock Mode**: Cliente Inforge REST com persistência sincronizada no `localStorage` para testes imediatos sem bloquear desenvolvimento.
- **RNF03 - Tipagem Estrita**: 100% de cobertura TypeScript em modelos, payloads e respostas de API.

---

## 3. Modelo de Dados & Banco de Dados (Inforge / PostgreSQL)

### 3.1 Tabelas

#### Tabela `users`
```sql
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'USER' CHECK (role IN ('MASTER_ADMIN', 'ADMIN', 'USER')),
    department VARCHAR(150),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Tabela `rooms`
```sql
CREATE TABLE IF NOT EXISTS rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    capacity INT NOT NULL,
    location VARCHAR(150) NOT NULL,
    description TEXT,
    color VARCHAR(20) DEFAULT '#002B5C',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Tabela `bookings`
```sql
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    user_name VARCHAR(150) NOT NULL,
    user_email VARCHAR(150) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED', 'REJECTED', 'CANCELLED')),
    is_priority BOOLEAN DEFAULT FALSE,
    rejection_reason TEXT,
    approved_by UUID,
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT chk_booking_time CHECK (end_time > start_time)
);
```
