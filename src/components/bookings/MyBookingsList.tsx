import React, { useState } from 'react';
import { Booking, Room } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Clock, Calendar, Trash2, Search } from 'lucide-react';
import { formatDateBr, formatTimeBr } from '../../utils/dateUtils';

interface MyBookingsListProps {
  bookings: Booking[];
  rooms: Room[];
  onCancelClick: (booking: Booking) => void;
  onNewBookingClick: () => void;
}

export const MyBookingsList: React.FC<MyBookingsListProps> = ({
  bookings,
  rooms,
  onCancelClick,
  onNewBookingClick,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'CONFIRMED' | 'CANCELLED'>('ALL');

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (booking.description && booking.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = filterStatus === 'ALL' || booking.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Barra de Filtros e Busca */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Campo de Busca */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Pesquisar por título ou pauta..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#002B5C]"
          />
        </div>

        {/* Filtro de Status */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterStatus('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterStatus === 'ALL'
                ? 'bg-[#002B5C] text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todos ({bookings.length})
          </button>
          <button
            onClick={() => setFilterStatus('CONFIRMED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterStatus === 'CONFIRMED'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Confirmados
          </button>
          <button
            onClick={() => setFilterStatus('CANCELLED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterStatus === 'CANCELLED'
                ? 'bg-tjpa-red text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Cancelados
          </button>
        </div>
      </div>

      {/* Lista de Cards */}
      {filteredBookings.length === 0 ? (
        <div className="bg-white p-12 rounded-xl shadow-sm border border-slate-200 text-center flex flex-col items-center justify-center">
          <Calendar className="w-12 h-12 text-slate-300 mb-3" />
          <h4 className="text-base font-bold text-slate-700">Nenhum agendamento encontrado</h4>
          <p className="text-xs text-slate-500 max-w-sm mt-1 mb-6">
            Você ainda não possui reuniões agendadas com os critérios selecionados.
          </p>
          <Button variant="gold" onClick={onNewBookingClick} className="font-bold">
            Fazer Novo Agendamento
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredBookings.map((booking) => {
            const room = rooms.find((r) => r.id === booking.room_id);
            const isCancelled = booking.status === 'CANCELLED';

            return (
              <div
                key={booking.id}
                className={`bg-white rounded-xl border p-5 shadow-sm transition-all flex flex-col justify-between ${
                  isCancelled ? 'border-slate-200 opacity-60' : 'border-slate-300 hover:shadow-md'
                }`}
                style={{
                  borderLeftWidth: '5px',
                  borderLeftColor: isCancelled ? '#94A3B8' : room?.color || '#002B5C',
                }}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h4 className="text-sm font-bold text-slate-900 line-clamp-2">
                      {booking.title}
                    </h4>
                    {isCancelled ? (
                      <Badge variant="red" size="sm" dot>
                        Cancelado
                      </Badge>
                    ) : (
                      <Badge variant="green" size="sm" dot>
                        Confirmado
                      </Badge>
                    )}
                  </div>

                  {/* Informações da Sala */}
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 mb-3">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: room?.color || '#002B5C' }}
                    />
                    <span>{room?.name || 'Sala SEPLAN'}</span>
                    <span className="text-slate-400 font-normal">• {room?.location}</span>
                  </div>

                  {/* Descrição */}
                  {booking.description && (
                    <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 mb-4">
                      {booking.description}
                    </p>
                  )}
                </div>

                {/* Rodapé do Card com Data, Horário e Ações */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-2">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs text-slate-600">
                    <span className="flex items-center gap-1 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-[#002B5C]" />
                      {formatDateBr(booking.start_time)}
                    </span>
                    <span className="flex items-center gap-1 font-bold text-[#002B5C]">
                      <Clock className="w-3.5 h-3.5" />
                      {formatTimeBr(booking.start_time)} - {formatTimeBr(booking.end_time)}
                    </span>
                  </div>

                  {!isCancelled && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onCancelClick(booking)}
                      className="text-tjpa-red hover:bg-red-50 hover:text-tjpa-red font-semibold text-xs"
                      leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                    >
                      Cancelar
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
