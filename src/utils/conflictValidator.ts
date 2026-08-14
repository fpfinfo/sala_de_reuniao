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
  ignoreBookingId?: string
): ConflictCheckResult => {
  const newStart = new Date(startTimeIso).getTime();
  const newEnd = new Date(endTimeIso).getTime();

  if (newEnd <= newStart) {
    return {
      hasConflict: true,
      message: 'O horário de término deve ser posterior ao horário de início.',
    };
  }

  // Filtra apenas agendamentos da mesma sala e confirmados
  const roomBookings = existingBookings.filter(
    (b) => b.room_id === roomId && b.status === 'CONFIRMED' && b.id !== ignoreBookingId
  );

  for (const booking of roomBookings) {
    const isOverlapping = checkIntervalOverlap(
      startTimeIso,
      endTimeIso,
      booking.start_time,
      booking.end_time
    );

    if (isOverlapping) {
      const formattedStart = formatTimeBr(booking.start_time);
      const formattedEnd = formatTimeBr(booking.end_time);
      return {
        hasConflict: true,
        conflictingBooking: booking,
        message: `Conflito de horário! A sala já está reservada por "${booking.user_name}" das ${formattedStart} às ${formattedEnd} ("${booking.title}").`,
      };
    }
  }

  return {
    hasConflict: false,
  };
};
