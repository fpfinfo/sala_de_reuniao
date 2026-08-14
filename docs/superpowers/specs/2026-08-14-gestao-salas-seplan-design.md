# Especificação Técnica de Design: Gestão de Agendamento de Salas de Reunião - SEPLAN

## 1. Visão Geral do Sistema
O sistema de **Gestão de Agendamento de Salas de Reunião para a SEPLAN** é uma aplicação web moderna, responsiva e de alta performance desenvolvida em React (TypeScript) com Tailwind CSS no frontend e integrada ao backend Inforge via cliente REST com autenticação JWT.

A aplicação atende ao gerenciamento das 3 salas de reuniões da SEPLAN, oferecendo visualização em grade horária diária das salas lado a lado, validação instantânea e no backend contra conflitos de horário, tela de login corporativa e área de gestão dos agendamentos do usuário.

---

## 2. Requisitos do Sistema

### 2.1 Requisitos Funcionais (RF)
- **RF01 - Autenticação de Usuários**: Login via credenciais (e-mail e senha) com emissão de token JWT pelo backend Inforge.
- **RF02 - Visualização de Salas e Grade Diária**: Apresentação das 3 salas da SEPLAN em colunas paralelas em grade horária das 08:00 às 19:00, demarcando claramente horários ocupados e disponíveis.
- **RF03 - Navegação Temporal**: Capacidade de alternar datas (Hoje, Dia Anterior, Próximo Dia e Seleção de Data específica).
- **RF04 - Novo Agendamento**: Cadastro de reserva com título, sala, data, hora de início, hora de término e descrição/pauta.
- **RF05 - Preenchimento Rápido por Clique**: Ao clicar em uma célula vazia da grade, o formulário de reserva abre automaticamente com a sala e horário selecionados.
- **RF06 - Validação de Conflito de Horário**:
  - *Frontend*: Verificação local antes do envio para desabilitar ou alertar colisões em tempo real.
  - *Backend*: Verificação atômica de sobreposição antes da inserção no banco de dados.
- **RF07 - Meus Agendamentos & Cancelamento**: Painel listando agendamentos do usuário logado com opção de cancelamento de reservas futuras.

### 2.2 Requisitos Não Funcionais (RNF)
- **RNF01 - Interface e Identidade Visual Institucional SEPLAN/TJPA**: Design corporativo seguindo rigorosamente a paleta oficial:
  - **Azul Marinho TJPA (`#002B5C`)**: Headers, botões primários, abas ativas e sidebar.
  - **Dourado/Ouro (`#C59B27`)**: Acentos visuais, badges de destaque, botões secundários institucionais.
  - **Cinza Claro (`#F1F3F6`)**: Fundo geral da aplicação e divisores suaves.
  - **Vermelho Alerta (`#ED1C24`)**: Indicadores de cancelamento, conflito de horário e ações destrutivas.
  - **Branco Puro (`#FFFFFF`)**: Superfície de cartões, modais e containers de dados.
- **RNF02 - Resiliência e Offline/Mock Mode**: Cliente Inforge REST estruturado com camada de fallback inteligente para testes e desenvolvimento local contínuo sem dependência externa estrita.
- **RNF03 - Tipagem Estrita**: 100% de cobertura TypeScript em modelos, payloads e respostas de API.

---

## 3. Modelo de Dados & Banco de Dados (Inforge / PostgreSQL)

### 3.1 Tabelas

#### Tabela `rooms`
```sql
CREATE TABLE IF NOT EXISTS rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    capacity INT NOT NULL DEFAULT 10,
    location VARCHAR(100) NOT NULL DEFAULT 'SEPLAN - Sede',
    description TEXT,
    color VARCHAR(20) DEFAULT '#2563EB',
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
    status VARCHAR(20) NOT NULL DEFAULT 'CONFIRMED',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT chk_booking_time CHECK (end_time > start_time)
);

CREATE INDEX idx_bookings_room_time ON bookings (room_id, start_time, end_time) WHERE status = 'CONFIRMED';
```

### 3.2 Salas Iniciais da SEPLAN
1. **Sala 1 - Executiva** (Capacidade: 12 pessoas, Cor: `#2563EB`) - Equipamento: TV 65", videoconferência, quadro branco.
2. **Sala 2 - Técnica** (Capacidade: 8 pessoas, Cor: `#059669`) - Equipamento: TV 55", mesa redonda.
3. **Sala 3 - Plenária** (Capacidade: 16 pessoas, Cor: `#7C3AED`) - Equipamento: Projetor, sistema de áudio, layout flexível.

---

## 4. Arquitetura de API e Serviços

### 4.1 Endpoints REST Inforge
- `POST /api/v1/auth/login`: Autenticação e retorno de token + dados do usuário.
- `GET /api/v1/rooms`: Lista todas as salas disponíveis.
- `GET /api/v1/bookings?date=YYYY-MM-DD`: Retorna agendamentos do dia selecionado.
- `GET /api/v1/bookings/my`: Retorna os agendamentos do usuário autenticado.
- `POST /api/v1/bookings`: Cria novo agendamento com validação de conflito no servidor.
- `DELETE /api/v1/bookings/:id`: Cancela agendamento existente.

---

## 5. Arquitetura do Frontend React

### 5.1 Estrutura de Arquivos
```
src/
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   └── Shell.tsx
│   ├── dashboard/
│   │   ├── RoomFilterBar.tsx
│   │   ├── DailyTimelineGrid.tsx
│   │   ├── TimeSlotCell.tsx
│   │   └── BookingCard.tsx
│   ├── bookings/
│   │   ├── BookingModal.tsx
│   │   ├── MyBookingsList.tsx
│   │   └── CancelConfirmModal.tsx
│   ├── auth/
│   │   └── LoginForm.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Modal.tsx
│       └── Toast.tsx
├── context/
│   ├── AuthContext.tsx
│   └── ToastContext.tsx
├── hooks/
│   ├── useRooms.ts
│   └── useBookings.ts
├── services/
│   ├── api.ts
│   ├── authService.ts
│   ├── roomsService.ts
│   └── bookingsService.ts
├── types/
│   └── index.ts
└── utils/
    ├── dateUtils.ts
    └── conflictValidator.ts
```

---

## 6. Plano de Testes e Validação
1. **Teste de Autenticação**: Validação de credenciais válidas e inválidas, armazenamento de token e persistência de sessão.
2. **Teste da Grade Horária**: Renderização das 3 salas para o dia atual e navegação entre datas.
3. **Teste de Criação de Agendamento**: Reserva normal em horário livre refletida imediatamente na grade.
4. **Teste de Conflito de Horário**: Tentativa de reserva em horário com sobreposição (parcial ou total) bloqueada com mensagem clara de erro.
5. **Teste de Cancelamento**: Cancelamento de reserva por parte do autor e liberação imediata do slot na grade.
