import { Booking, ConflictCheckResult } from '../types';
import { formatTimeBr } from './dateUtils';

/**
 * Verifica se dois intervalos de tempo colidem.
 * Regra: startA < endB && endA > startB
 */
export const checkIntervalOverlap = (
  startA: Date | string,
  endA: Date | string,
  startB: Date | string,
  endB: Date | string
): boolean => {
  const sA = new Date(startA).getTime();
  const eA = new Date(endA).getTime();
  const sB = new Date(startB).getTime();
  const eB = new Date(endB).getTime();

  return sA < eB && eA > sB;
};

/**
 * Valida se um novo agendamento tem conflito com agendamentos existentes na mesma sala.
 */
export const validateBookingConflict = (
  roomId: string,
  startTimeIso: string,
  endTimeIso: string,
  existingBookings: Booking[],
  ignoreBookingId?: string,
  isPriorityBooking: boolean = false
): ConflictCheckResult => {
  const newStart = new Date(startTimeIso).getTime();
  const newEnd = new Date(endTimeIso).getTime();

  if (newEnd <= newStart) {
    return {
      hasConflict: true,
      message: 'O horário de término deve ser posterior ao horário de início.',
    };
  }

  // Considera apenas agendamentos da mesma sala que estejam CONFIRMED ou PENDING
  const activeBookings = existingBookings.filter(
    (b) =>
      b.room_id === roomId &&
      (b.status === 'CONFIRMED' || b.status === 'PENDING') &&
      b.id !== ignoreBookingId
  );

  for (const booking of activeBookings) {
    const isOverlapping = checkIntervalOverlap(
      startTimeIso,
      endTimeIso,
      booking.start_time,
      booking.end_time
    );

    if (isOverlapping) {
      const formattedStart = formatTimeBr(booking.start_time);
      const formattedEnd = formatTimeBr(booking.end_time);

      // Se quem está agendando for Admin com prioridade e a colisão for com PENDING, não bloqueia
      if (isPriorityBooking && booking.status === 'PENDING') {
        continue;
      }

      const statusText = booking.status === 'PENDING' ? '(Pendente de Aprovação)' : '(Confirmado)';

      return {
        hasConflict: true,
        conflictingBooking: booking,
        isPendingConflict: booking.status === 'PENDING',
        message: `Conflito de horário! A sala já possui reserva ${statusText} por "${booking.user_name}" das ${formattedStart} às ${formattedEnd} ("${booking.title}").`,
      };
    }
  }

  return {
    hasConflict: false,
  };
};
