import { Booking, CreateBookingDTO } from '../types';
import { ApiClient } from './api';
import { authService } from './authService';
import { combineDateAndTime, getTodayString } from '../utils/dateUtils';
import { validateBookingConflict } from '../utils/conflictValidator';

const BOOKINGS_STORAGE_KEY = 'seplan_salas_bookings_data';

// Agendamentos iniciais para demonstração realista na SEPLAN
const getInitialSeedBookings = (): Booking[] => {
  const today = getTodayString();
  return [
    {
      id: 'bk-seed-01',
      room_id: 'room-seplan-01',
      user_id: 'usr-seplan-001',
      user_name: 'Fabio Freitas',
      user_email: 'fabio.freitas@tjpa.jus.br',
      title: 'Alinhamento Orçamentário e Cronograma SEPLAN',
      description: 'Reunião executiva com os gestores das coordenadorias financeiras.',
      start_time: combineDateAndTime(today, '09:00'),
      end_time: combineDateAndTime(today, '10:30'),
      status: 'CONFIRMED',
      created_at: new Date().toISOString(),
    },
    {
      id: 'bk-seed-02',
      room_id: 'room-seplan-02',
      user_id: 'usr-seplan-002',
      user_name: 'Coordenadoria de Planejamento',
      user_email: 'planejamento@tjpa.jus.br',
      title: 'Revisão Técnica do Plano Plurianual (PPA)',
      description: 'Análise técnica das metas físicas e financeiras do tribunal.',
      start_time: combineDateAndTime(today, '14:00'),
      end_time: combineDateAndTime(today, '16:00'),
      status: 'CONFIRMED',
      created_at: new Date().toISOString(),
    },
    {
      id: 'bk-seed-03',
      room_id: 'room-seplan-03',
      user_id: 'usr-seplan-003',
      user_name: 'Secretaria-Geral',
      user_email: 'secgeral@tjpa.jus.br',
      title: 'Workshop de Governança e Inovação',
      description: 'Apresentação dos novos painéis gerenciais e automações.',
      start_time: combineDateAndTime(today, '10:00'),
      end_time: combineDateAndTime(today, '12:00'),
      status: 'CONFIRMED',
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
      // Tenta Inforge REST API
      const remoteBookings = await ApiClient.request<Booking[]>(`/bookings?date=${dateStr}`);
      return remoteBookings;
    } catch (error) {
      // Fallback local
      const all = this.getLocalBookings();
      return all.filter((b) => {
        const bookingDate = b.start_time.substring(0, 10);
        return bookingDate === dateStr && b.status === 'CONFIRMED';
      });
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
        .filter((b) => b.user_id === currentUser.id || b.user_email === currentUser.email)
        .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime());
    }
  },

  /**
   * Cria um novo agendamento validando conflitos
   */
  async createBooking(dto: CreateBookingDTO): Promise<Booking> {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('Usuário não autenticado.');
    }

    const startIso = combineDateAndTime(dto.date, dto.start_time);
    const endIso = combineDateAndTime(dto.date, dto.end_time);

    // Validação de conflito antecipada
    const currentDayBookings = await this.getBookingsByDate(dto.date);
    const conflict = validateBookingConflict(dto.room_id, startIso, endIso, currentDayBookings);

    if (conflict.hasConflict) {
      throw new Error(conflict.message || 'Horário indisponível para esta sala.');
    }

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
      status: 'CONFIRMED',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    try {
      // Envia ao Inforge
      const created = await ApiClient.request<Booking>('/bookings', {
        method: 'POST',
        body: JSON.stringify(newBooking),
      });
      return created;
    } catch (error) {
      // Salva localmente com persistência
      const all = this.getLocalBookings();
      all.push(newBooking);
      this.saveLocalBookings(all);
      return newBooking;
    }
  },

  /**
   * Cancela uma reserva
   */
  async cancelBooking(bookingId: string): Promise<void> {
    try {
      await ApiClient.request(`/bookings/${bookingId}/cancel`, {
        method: 'PATCH',
      });
    } catch (error) {
      // Atualiza localmente
      const all = this.getLocalBookings();
      const updated = all.map((b) => (b.id === bookingId ? { ...b, status: 'CANCELLED' as const } : b));
      this.saveLocalBookings(updated);
    }
  },
};
