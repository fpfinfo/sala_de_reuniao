# 🏛️ Gestão de Agendamento de Salas de Reunião — SEPLAN / TJPA

Sistema web corporativo para visualização de disponibilidade, reserva e gestão de agendamentos das 3 salas de reuniões da **Secretaria de Planejamento, Coordenação e Finanças (SEPLAN)** do Tribunal de Justiça do Estado do Pará.

---

## 🎨 Identidade Visual Institucional
Desenvolvido com a paleta oficial do TJPA:
- **Azul Marinho TJPA (`#002B5C`)**: Cabeçalho principal, elementos estruturais e botões corporativos.
- **Dourado / Ouro (`#C59B27`)**: Destaques, badges de relevância e botões de ação prioritária.
- **Cinza Superfície (`#F1F3F6`)**: Fundo geral e containers limpos.
- **Vermelho Alerta (`#ED1C24`)**: Avisos de cancelamento e conflito de horário.
- **Branco Puro (`#FFFFFF`)**: Superfície dos cartões e modais.

---

## 🚀 Funcionalidades Principais
1. **Grade Horária Diária (Timeline lado a lado)**:
   - Visualização das 3 salas da SEPLAN em colunas paralelas.
   - Divisão de horários de 08:00 às 19:00.
   - Destaque claro de horários ocupados (com dados da reunião e responsável) e disponíveis.
   - Clique em qualquer horário livre para agendamento rápido com pré-preenchimento automático da sala e hora.

2. **Validação de Conflitos em Dupla Camada**:
   - **Frontend**: Alerta instantâneo no formulário ao selecionar horários com colisão temporal ($start_A < end_B \land end_A > start_B$).
   - **Backend Inforge**: Restrição de exclusão temporal PostgreSQL (`EXCLUDE USING gist`) para consistência em concorrência.

3. **Painel "Meus Agendamentos"**:
   - Listagem com busca textual por título ou pauta.
   - Filtro por status (Todos, Confirmados, Cancelados).
   - Cancelamento com diálogo de confirmação seguro.

4. **Autenticação Inforge & Resiliência**:
   - Integração com bearer token JWT.
   - Camada de mock com persistência local para execução imediata em ambiente de desenvolvimento.

---

## 📁 Estrutura de Arquivos
```
SALA_REUNIAO/
├── inforge/
│   └── schema.sql              # Schema PostgreSQL com tabelas, restrições e triggers
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   └── LoginForm.tsx   # Tela de login institucional SEPLAN
│   │   ├── bookings/
│   │   │   ├── BookingModal.tsx       # Modal de novo agendamento com validação
│   │   │   ├── MyBookingsList.tsx     # Lista de reuniões com busca e filtros
│   │   │   └── CancelConfirmModal.tsx # Confirmação de cancelamento
│   │   ├── dashboard/
│   │   │   ├── RoomFilterBar.tsx      # Navegação de datas e filtros
│   │   │   ├── DailyTimelineGrid.tsx  # Grade horária diária das 3 salas
│   │   │   └── BookingCard.tsx        # Card da reunião na grade
│   │   ├── layout/
│   │   │   ├── Header.tsx      # Cabeçalho oficial SEPLAN / TJPA
│   │   │   └── Shell.tsx       # Container principal da aplicação
│   │   └── ui/
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       ├── Modal.tsx
│   │       ├── Badge.tsx
│   │       └── ToastContainer.tsx
│   ├── context/
│   │   ├── AuthContext.tsx     # Gerenciamento de sessão
│   │   └── ToastContext.tsx    # Notificações do sistema
│   ├── services/
│   │   ├── api.ts              # Cliente HTTP Inforge
│   │   ├── authService.ts      # Autenticação e sessão
│   │   ├── roomsService.ts     # Gerenciamento das salas
│   │   └── bookingsService.ts  # CRUD de agendamentos e persistência
│   ├── types/
│   │   └── index.ts            # Tipagens TypeScript
│   ├── utils/
│   │   ├── dateUtils.ts        # Utilitários de data e hora
│   │   └── conflictValidator.ts# Motor de validação de sobreposição
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## 🛠️ Como Executar Localmente

### 1. Instalar Dependências
```bash
npm install
```

### 2. Rodar o Servidor de Desenvolvimento
```bash
npm run dev
```
A aplicação abrirá automaticamente em `http://localhost:3000`.

### 3. Build de Produção
```bash
npm run build
```
