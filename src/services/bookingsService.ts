import { Booking, CreateBookingDTO } from '../types';
import { ApiClient } from './api';
import { authService } from './authService';
import { combineDateAndTime, getTodayString } from '../utils/dateUtils';
import { validateBookingConflict, checkIntervalOverlap } from '../utils/conflictValidator';

const BOOKINGS_STORAGE_KEY = 'seplan_salas_bookings_data';

// Agendamentos iniciais para demonstração realista na SEPLAN com PENDING e CONFIRMED
const getInitialSeedBookings = (): Booking[] => {
  const today = getTodayString();
  return [
    {
      id: 'bk-seed-01',
      room_id: 'room-seplan-01',
      user_id: 'usr-seplan-001',
      user_name: 'Fabio Freitas (Gabinete)',
      user_email: 'fabio.freitas@tjpa.jus.br',
      title: 'Alinhamento com Secretário de Planejamento e Diretores',
      description: 'Definição de diretrizes estratégicas e prioridades orçamentárias do tribunal.',
      start_time: combineDateAndTime(today, '09:00'),
      end_time: combineDateAndTime(today, '10:30'),
      status: 'CONFIRMED',
      is_priority: true,
      created_at: new Date().toISOString(),
    },
    {
      id: 'bk-seed-02',
      room_id: 'room-seplan-02',
      user_id: 'usr-seplan-003',
      user_name: 'Servidor Finanças',
      user_email: 'servidor.financas@tjpa.jus.br',
      title: 'Revisão Técnica de Empenhos e Liquidações',
      description: 'Análise de relatórios de execução orçamentária do primeiro quadrimestre.',
      start_time: combineDateAndTime(today, '14:00'),
      end_time: combineDateAndTime(today, '15:30'),
      status: 'PENDING',
      created_at: new Date().toISOString(),
    },
    {
      id: 'bk-seed-03',
      room_id: 'room-seplan-03',
      user_id: 'usr-seplan-004',
      user_name: 'Servidor Arrecadação',
      user_email: 'servidor.arrecadacao@tjpa.jus.br',
      title: 'Apresentação de Metas da CODAR',
      description: 'Acompanhamento do painel de custas e arrecadação judiciária.',
      start_time: combineDateAndTime(today, '11:00'),
      end_time: combineDateAndTime(today, '12:30'),
      status: 'PENDING',
      created_at: new Date().toISOString(),
    },
  ];
};

export const bookingsService = {
  /**
   * Obtém lista local de todos os agendamentos persistidos
   */
  getLocalBookings(): Booking[] {
    const raw = localStorage.getItem(BOOKINGS_STORAGE_KEY);
    if (!raw) {
      const initial = getInitialSeedBookings();
      localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return getInitialSeedBookings();
    }
  },

  /**
   * Salva lista local
   */
  saveLocalBookings(bookings: Booking[]): void {
    localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(bookings));
  },

  /**
   * Busca agendamentos por data (YYYY-MM-DD)
   */
  async getBookingsByDate(dateStr: string): Promise<Booking[]> {
    try {
      const remoteBookings = await ApiClient.request<Booking[]>(`/bookings?date=${dateStr}`);
      return remoteBookings;
    } catch (error) {
      const all = this.getLocalBookings();
      return all.filter((b) => {
        const bookingDate = b.start_time.substring(0, 10);
        return (
          bookingDate === dateStr &&
          (b.status === 'CONFIRMED' || b.status === 'PENDING')
        );
      });
    }
  },

  /**
   * Busca todas as solicitações pendentes de aprovação (Admin)
   */
  async getPendingBookings(): Promise<Booking[]> {
    try {
      return await ApiClient.request<Booking[]>('/bookings/pending');
    } catch (error) {
      const all = this.getLocalBookings();
      return all
        .filter((b) => b.status === 'PENDING')
        .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
    }
  },

  /**
   * Busca agendamentos do usuário logado
   */
  async getMyBookings(): Promise<Booking[]> {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) return [];

    try {
      return await ApiClient.request<Booking[]>('/bookings/my');
    } catch (error) {
      const all = this.getLocalBookings();
      return all
        .filter((b) => b.user_id === currentUser.id || b.user_email.toLowerCase() === currentUser.email.toLowerCase())
        .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime());
    }
  },

  /**
   * Cria um novo agendamento
   * - Se for ADMIN/MASTER_ADMIN ou marcado como Prioridade: status = CONFIRMED
   * - Se for USER: status = PENDING
   */
  async createBooking(dto: CreateBookingDTO): Promise<Booking> {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('Usuário não autenticado.');
    }

    const startIso = combineDateAndTime(dto.date, dto.start_time);
    const endIso = combineDateAndTime(dto.date, dto.end_time);

    const isAdmin = currentUser.role === 'ADMIN' || currentUser.role === 'MASTER_ADMIN';
    const isPriority = isAdmin && !!dto.is_priority;

    // Validação de conflito
    const currentDayBookings = await this.getBookingsByDate(dto.date);
    const conflict = validateBookingConflict(
      dto.room_id,
      startIso,
      endIso,
      currentDayBookings,
      undefined,
      isPriority
    );

    if (conflict.hasConflict) {
      throw new Error(conflict.message || 'Horário indisponível para esta sala.');
    }

    const all = this.getLocalBookings();

    // Se for prioridade e houver reservas PENDING no mesmo horário, cancela/rejeita elas automaticamente
    if (isPriority) {
      all.forEach((b) => {
        if (
          b.room_id === dto.room_id &&
          b.status === 'PENDING' &&
          checkIntervalOverlap(startIso, endIso, b.start_time, b.end_time)
        ) {
          b.status = 'REJECTED';
          b.rejection_reason = 'Horário reservado com prioridade para o Gabinete / Secretário de Planejamento (SEPLAN).';
          b.updated_at = new Date().toISOString();
        }
      });
    }

    const initialStatus = isAdmin ? 'CONFIRMED' : 'PENDING';

    const newBooking: Booking = {
      id: 'bk-' + Math.random().toString(36).substr(2, 9),
      room_id: dto.room_id,
      user_id: currentUser.id,
      user_name: currentUser.name,
      user_email: currentUser.email,
      title: dto.title.trim(),
      description: dto.description?.trim() || '',
      start_time: startIso,
      end_time: endIso,
      status: initialStatus,
      is_priority: isPriority,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    try {
      const created = await ApiClient.request<Booking>('/bookings', {
        method: 'POST',
        body: JSON.stringify(newBooking),
      });
      return created;
    } catch (error) {
      all.push(newBooking);
      this.saveLocalBookings(all);
      return newBooking;
    }
  },

  /**
   * Aprova uma solicitação pendente (Admin)
   */
  async approveBooking(bookingId: string): Promise<void> {
    const currentUser = authService.getCurrentUser();
    if (currentUser?.role !== 'ADMIN' && currentUser?.role !== 'MASTER_ADMIN') {
      throw new Error('Apenas administradores podem aprovar agendamentos.');
    }

    try {
      await ApiClient.request(`/bookings/${bookingId}/approve`, {
        method: 'PATCH',
      });
    } catch (error) {
      const all = this.getLocalBookings();
      const updated = all.map((b) => {
        if (b.id === bookingId) {
          return {
            ...b,
            status: 'CONFIRMED' as const,
            approved_by: currentUser.id,
            approved_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
        }
        return b;
      });
      this.saveLocalBookings(updated);
    }
  },

  /**
   * Rejeita uma solicitação pendente com justificativa (Admin)
   */
  async rejectBooking(bookingId: string, reason: string): Promise<void> {
    const currentUser = authService.getCurrentUser();
    if (currentUser?.role !== 'ADMIN' && currentUser?.role !== 'MASTER_ADMIN') {
      throw new Error('Apenas administradores podem rejeitar agendamentos.');
    }

    try {
      await ApiClient.request(`/bookings/${bookingId}/reject`, {
        method: 'PATCH',
        body: JSON.stringify({ reason }),
      });
    } catch (error) {
      const all = this.getLocalBookings();
      const updated = all.map((b) => {
        if (b.id === bookingId) {
          return {
            ...b,
            status: 'REJECTED' as const,
            rejection_reason: reason.trim() || 'Horário indisponível por decisão administrativa.',
            updated_at: new Date().toISOString(),
          };
        }
        return b;
      });
      this.saveLocalBookings(updated);
    }
  },

  /**
   * Cancela uma reserva (pelo próprio solicitante ou admin)
   */
  async cancelBooking(bookingId: string): Promise<void> {
    try {
      await ApiClient.request(`/bookings/${bookingId}/cancel`, {
        method: 'PATCH',
      });
    } catch (error) {
      const all = this.getLocalBookings();
      const updated = all.map((b) =>
        b.id === bookingId ? { ...b, status: 'CANCELLED' as const, updated_at: new Date().toISOString() } : b
      );
      this.saveLocalBookings(updated);
    }
  },
};
