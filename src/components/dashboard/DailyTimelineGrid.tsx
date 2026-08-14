import React from 'react';
import { Room, Booking } from '../../types';
import { Clock, Plus, Users } from 'lucide-react';

import { BookingCard } from './BookingCard';

interface DailyTimelineGridProps {
  rooms: Room[];
  bookings: Booking[];
  selectedRoomId: string | 'ALL';
  selectedDate: string;
  onQuickBooking: (roomId: string, timeSlot: string) => void;
  onBookingClick: (booking: Booking) => void;
}

export const DailyTimelineGrid: React.FC<DailyTimelineGridProps> = ({
  rooms,
  bookings,
  selectedRoomId,
  onQuickBooking,
  onBookingClick,
}) => {
  // Horários das 08:00 às 18:00 com incrementos de 1h para visualização limpa
  const hours = [
    '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
  ];

  const displayedRooms =
    selectedRoomId === 'ALL'
      ? rooms
      : rooms.filter((r) => r.id === selectedRoomId);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Cabeçalho da Grade de Salas */}
      <div className="grid grid-cols-[80px_repeat(auto-fit,minmax(220px,1fr))] border-b border-slate-200 bg-[#F1F3F6]/70">
        <div className="p-3.5 text-center text-xs font-bold text-slate-500 uppercase tracking-wider border-r border-slate-200 flex items-center justify-center gap-1">
          <Clock className="w-3.5 h-3.5 text-[#002B5C]" />
          <span>Hora</span>
        </div>

        {displayedRooms.map((room) => (
          <div
            key={room.id}
            className="p-3.5 border-r last:border-r-0 border-slate-200 flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: room.color }}
              />
              <span className="text-xs sm:text-sm font-bold text-slate-800">
                {room.name}
              </span>
            </div>
            <span className="text-[11px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200 flex items-center gap-1">
              <Users className="w-3 h-3 text-slate-400" />
              {room.capacity}
            </span>
          </div>
        ))}
      </div>

      {/* Linhas da Grade de Horários */}
      <div className="divide-y divide-slate-100">
        {hours.map((hourStr) => {
          const currentHourNum = parseInt(hourStr.split(':')[0], 10);

          return (
            <div
              key={hourStr}
              className="grid grid-cols-[80px_repeat(auto-fit,minmax(220px,1fr))] min-h-[96px] group transition-colors"
            >
              {/* Coluna de Horário */}
              <div className="p-2 border-r border-slate-200 bg-slate-50/70 flex items-start justify-center text-xs font-bold text-slate-600">
                <span>{hourStr}</span>
              </div>

              {/* Colunas de cada Sala */}
              {displayedRooms.map((room) => {
                // Filtra agendamentos desta sala que coincidem com este bloco de horário
                const matchingBookings = bookings.filter((b) => {
                  if (b.room_id !== room.id || b.status !== 'CONFIRMED') return false;

                  const start = new Date(b.start_time);
                  const end = new Date(b.end_time);
                  const startHour = start.getHours();
                  const endHour = end.getHours() + (end.getMinutes() > 0 ? 1 : 0);

                  return currentHourNum >= startHour && currentHourNum < endHour;
                });

                // Se a reunião COMEÇA nesta hora, renderizamos o card
                const startingBookings = matchingBookings.filter((b) => {
                  return new Date(b.start_time).getHours() === currentHourNum;
                });

                const isSlotOccupied = matchingBookings.length > 0;

                return (
                  <div
                    key={`${room.id}-${hourStr}`}
                    className={`p-2 border-r last:border-r-0 border-slate-200 relative flex flex-col justify-start gap-1 transition-all ${
                      isSlotOccupied
                        ? 'bg-slate-50/50'
                        : 'hover:bg-blue-50/40 cursor-pointer'
                    }`}
                    onClick={() => {
                      if (!isSlotOccupied) {
                        onQuickBooking(room.id, hourStr);
                      }
                    }}
                  >
                    {/* Exibe Reuniões que começam nesta hora */}
                    {startingBookings.map((b) => (
                      <BookingCard
                        key={b.id}
                        booking={b}
                        room={room}
                        onClick={() => onBookingClick(b)}
                      />
                    ))}

                    {/* Continuação de reunião que começou antes */}
                    {isSlotOccupied && startingBookings.length === 0 && (
                      <div className="h-full flex items-center justify-center">
                        <span className="text-[11px] font-medium text-slate-400 italic">
                          (Reunião em andamento)
                        </span>
                      </div>
                    )}

                    {/* Botão Hover de Reserva Rápida em Slot Vazio */}
                    {!isSlotOccupied && (
                      <div className="hidden group-hover:flex items-center justify-center h-full text-xs font-semibold text-[#002B5C] gap-1 opacity-0 hover:opacity-100 transition-opacity">
                        <Plus className="w-3.5 h-3.5 text-[#C59B27]" />
                        <span>Reservar às {hourStr}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};
