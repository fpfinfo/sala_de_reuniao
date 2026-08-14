import { format, parse, isToday, isTomorrow, isYesterday, addDays, subDays, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const formatDateBr = (dateInput: string | Date): string => {
  const date = typeof dateInput === 'string' ? parseISO(dateInput) : dateInput;
  return format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
};

export const formatShortDate = (dateInput: string | Date): string => {
  const date = typeof dateInput === 'string' ? parseISO(dateInput) : dateInput;
  return format(date, 'dd/MM/yyyy');
};

export const formatTimeBr = (dateInput: string | Date): string => {
  const date = typeof dateInput === 'string' ? parseISO(dateInput) : dateInput;
  return format(date, 'HH:mm');
};

export const formatRelativeDateLabel = (dateStr: string): string => {
  const date = parse(dateStr, 'yyyy-MM-dd', new Date());
  if (isToday(date)) return 'Hoje';
  if (isTomorrow(date)) return 'Amanhã';
  if (isYesterday(date)) return 'Ontem';
  return format(date, "EEEE, dd/MM", { locale: ptBR });
};

export const getNextDay = (dateStr: string): string => {
  const date = parse(dateStr, 'yyyy-MM-dd', new Date());
  return format(addDays(date, 1), 'yyyy-MM-dd');
};

export const getPreviousDay = (dateStr: string): string => {
  const date = parse(dateStr, 'yyyy-MM-dd', new Date());
  return format(subDays(date, 1), 'yyyy-MM-dd');
};

export const getTodayString = (): string => {
  return format(new Date(), 'yyyy-MM-dd');
};

/**
 * Gera lista de horários (ex: 08:00, 08:30, 09:00...)
 */
export const generateTimeSlots = (
  startHour: number = 8,
  endHour: number = 19,
  stepMinutes: number = 30
): string[] => {
  const slots: string[] = [];
  for (let hour = startHour; hour < endHour; hour++) {
    for (let min = 0; min < 60; min += stepMinutes) {
      const hStr = hour.toString().padStart(2, '0');
      const mStr = min.toString().padStart(2, '0');
      slots.push(`${hStr}:${mStr}`);
    }
  }
  // Adiciona o horário de término final
  const endHStr = endHour.toString().padStart(2, '0');
  slots.push(`${endHStr}:00`);
  return slots;
};

/**
 * Converte data (YYYY-MM-DD) e hora (HH:mm) para ISO String UTC/Local
 */
export const combineDateAndTime = (dateStr: string, timeStr: string): string => {
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hour, minute] = timeStr.split(':').map(Number);
  const date = new Date(year, month - 1, day, hour, minute, 0, 0);
  return date.toISOString();
};
