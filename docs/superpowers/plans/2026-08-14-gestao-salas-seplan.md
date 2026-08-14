# Gestão de Agendamento de Salas de Reunião SEPLAN - Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) ou superpowers:executing-plans para implementar este plano tarefa por tarefa.

**Goal:** Construir a aplicação web completa de gestão e agendamento para as 3 salas de reuniões da SEPLAN (TJPA), com grade horária diária lado a lado, validação estrita de conflitos de horário, autenticação corporativa Inforge e paleta oficial institucional.

**Architecture:** Frontend modular em React 18+ com TypeScript e Tailwind CSS, integrado a uma camada de serviços Inforge REST com suporte a tokens JWT, checagem antecipada de colisão de horários e fallback de persistência para execução local imediata.

**Tech Stack:** React 18, Vite, TypeScript, Tailwind CSS, Lucide React, date-fns.

**Spec:** [docs/superpowers/specs/2026-08-14-gestao-salas-seplan-design.md](file:///c:/Users/fabio.freitas/Documents/GitHub/SALA_REUNIAO/docs/superpowers/specs/2026-08-14-gestao-salas-seplan-design.md)

## Global Constraints
- Paleta Oficial SEPLAN/TJPA: Azul Marinho (`#002B5C`), Dourado (`#C59B27`), Cinza Superfície (`#F1F3F6`), Vermelho Alerta (`#ED1C24`), Branco (`#FFFFFF`).
- 3 Salas Fixas: Sala 1 - Executiva (12 lugares), Sala 2 - Técnica (8 lugares), Sala 3 - Plenária (16 lugares).
- Horário operacional da grade diária: 08:00 às 19:00.
- Validação de conflito: Sobreposição temporal bloqueada em $start_A < end_B \land end_A > start_B$.

---

### Task 1: Inicialização do Projeto e Configuração do Tailwind com Cores Institucionais

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.node.json`, `index.html`, `tailwind.config.js`, `postcss.config.js`, `src/index.css`, `src/main.tsx`

**Interfaces:**
- Produces: Base Vite + React + Tailwind com as variáveis e classes de cores corporativas (`bg-tjpa-navy`, `text-tjpa-gold`, etc.).

- [ ] **Step 1: Criar package.json e dependências essenciais**
- [ ] **Step 2: Configurar Vite, TypeScript e Tailwind CSS com tema TJPA/SEPLAN**
- [ ] **Step 3: Criar index.html e index.css com tipografia e resets limpos**
- [ ] **Step 4: Verificar compilação com `npm install` e build check**

---

### Task 2: Definição de Tipos e Utilitários de Validação de Conflito de Horário

**Files:**
- Create: `src/types/index.ts`, `src/utils/dateUtils.ts`, `src/utils/conflictValidator.ts`

**Interfaces:**
- Produces:
  - `interface Room`, `interface Booking`, `interface User`, `interface TimeSlot`
  - `hasTimeConflict(newBooking, existingBookings): boolean`
  - `generateTimeSlots(startHour, endHour, stepMinutes): string[]`
  - `formatDateBr(date), formatTimeBr(date)`

- [ ] **Step 1: Criar `src/types/index.ts` com todas as interfaces do domínio**
- [ ] **Step 2: Criar `src/utils/dateUtils.ts` com funções auxiliares de data e hora**
- [ ] **Step 3: Criar `src/utils/conflictValidator.ts` com testes de colisão temporal de intervalos**

---

### Task 3: Camada de Serviços Inforge (API Client, Auth, Rooms e Bookings)

**Files:**
- Create: `src/services/api.ts`, `src/services/authService.ts`, `src/services/roomsService.ts`, `src/services/bookingsService.ts`

**Interfaces:**
- Consumes: Tipos de `src/types/index.ts`
- Produces:
  - `authService.login(email, password)`
  - `authService.getCurrentUser()`, `authService.logout()`
  - `roomsService.getRooms(): Promise<Room[]>`
  - `bookingsService.getBookingsByDate(date): Promise<Booking[]>`
  - `bookingsService.getMyBookings(): Promise<Booking[]>`
  - `bookingsService.createBooking(payload): Promise<Booking>`
  - `bookingsService.cancelBooking(id): Promise<void>`

- [ ] **Step 1: Implementar `src/services/api.ts` com interceptor JWT e armazenamento**
- [ ] **Step 2: Implementar `src/services/authService.ts` com autenticação e sessão**
- [ ] **Step 3: Implementar `src/services/roomsService.ts` com seed padrão das 3 salas SEPLAN**
- [ ] **Step 4: Implementar `src/services/bookingsService.ts` com validação de conflito e persistência**

---

### Task 4: Contextos Globais (AuthContext e ToastContext)

**Files:**
- Create: `src/context/AuthContext.tsx`, `src/context/ToastContext.tsx`

**Interfaces:**
- Produces: `useAuth()` e `useToast()` para gerenciamento de sessão de usuário e notificações na aplicação.

- [ ] **Step 1: Criar `src/context/ToastContext.tsx` para feedback de sucesso e erro**
- [ ] **Step 2: Criar `src/context/AuthContext.tsx` para controle de login/logout e usuário logado**

---

### Task 5: Componentes UI de Base e Layout Institucional

**Files:**
- Create: `src/components/ui/Button.tsx`, `src/components/ui/Input.tsx`, `src/components/ui/Modal.tsx`, `src/components/ui/Badge.tsx`, `src/components/ui/ToastContainer.tsx`, `src/components/layout/Header.tsx`, `src/components/layout/Shell.tsx`

**Interfaces:**
- Produces: Componentes reutilizáveis com a identidade visual `#002B5C`, `#C59B27`, `#F1F3F6`.

- [ ] **Step 1: Construir componentes de UI (`Button`, `Input`, `Modal`, `Badge`, `ToastContainer`)**
- [ ] **Step 2: Construir o `Header.tsx` corporativo com brasão/título SEPLAN, dados do usuário e botão de logout**
- [ ] **Step 3: Construir o container responsivo `Shell.tsx`**

---

### Task 6: Grade Horária Diária das 3 Salas (Timeline Grid)

**Files:**
- Create: `src/components/dashboard/RoomFilterBar.tsx`, `src/components/dashboard/DailyTimelineGrid.tsx`, `src/components/dashboard/BookingCard.tsx`

**Interfaces:**
- Consumes: `Room`, `Booking`, `dateUtils`, `useAuth`
- Produces: Visualização das 3 salas lado a lado, com blocos horários coloridos de 08:00 às 19:00 e clique para agendamento rápido em horário livre.

- [ ] **Step 1: Criar `RoomFilterBar.tsx` com navegação de datas (Hoje / Anterior / Próximo / Calendário) e resumo das salas**
- [ ] **Step 2: Criar `BookingCard.tsx` para exibição de reunião com sala, responsável e horário**
- [ ] **Step 3: Criar `DailyTimelineGrid.tsx` com as colunas paralelas das 3 salas e slots interativos**

---

### Task 7: Modal de Novo Agendamento com Validação Imediata de Conflitos

**Files:**
- Create: `src/components/bookings/BookingModal.tsx`

**Interfaces:**
- Consumes: `bookingsService`, `roomsService`, `conflictValidator`, `useToast`
- Produces: Formulário modal com Título, Sala, Data, Hora Início, Hora Término, Pauta e feedback visual imediato se houver sobreposição.

- [ ] **Step 1: Estruturar formulário com seleção das 3 salas e seletores de horário**
- [ ] **Step 2: Integrar validação reativa de colisão de horário (alerta em tempo real)**
- [ ] **Step 3: Integrar submissão com `bookingsService.createBooking` e atualização da grade**

---

### Task 8: Painel "Meus Agendamentos" e Cancelamento de Reservas

**Files:**
- Create: `src/components/bookings/MyBookingsList.tsx`, `src/components/bookings/CancelConfirmModal.tsx`

**Interfaces:**
- Consumes: `bookingsService`, `useAuth`, `useToast`
- Produces: Tabela / lista das reservas do usuário com status, data/hora, sala e botão de cancelamento com diálogo de confirmação.

- [ ] **Step 1: Criar lista com filtros (Próximas Reuniões / Realizadas / Canceladas)**
- [ ] **Step 2: Criar modal de confirmação de cancelamento e chamada ao serviço**

---

### Task 9: Tela de Autenticação (Login) e Integração Geral na Aplicação

**Files:**
- Create: `src/components/auth/LoginForm.tsx`, `src/App.tsx`

**Interfaces:**
- Produces: Fluxo completo de login, autenticação, roteamento entre Dashboard e Meus Agendamentos, e injeção dos contextos globais.

- [ ] **Step 1: Criar `LoginForm.tsx` com layout corporativo SEPLAN**
- [ ] **Step 2: Integrar tudo no `src/App.tsx` com controle de abas (Grade Diária / Meus Agendamentos) e modais**

---

### Task 10: Validação, Testes e Documentação

**Files:**
- Create: `README.md`, `supabase/schema.sql` ou `inforge/schema.sql`

- [ ] **Step 1: Criar arquivo SQL com schema completo e triggers para Inforge/Postgres**
- [ ] **Step 2: Validar fluxo completo de teste (Login -> Agendamento -> Conflito -> Cancelamento)**
- [ ] **Step 3: Documentar instruções de execução no `README.md`**
