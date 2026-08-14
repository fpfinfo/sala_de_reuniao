import React from 'react';
import { Booking, Room } from '../../types';
import { Clock, User, FileText, Crown, AlertCircle } from 'lucide-react';
import { formatTimeBr } from '../../utils/dateUtils';

interface BookingCardProps {
  booking: Booking;
  room?: Room;
  onClick?: () => void;
}

export const BookingCard: React.FC<BookingCardProps> = ({
  booking,
  room,
  onClick,
}) => {
  const startTime = formatTimeBr(booking.start_time);
  const endTime = formatTimeBr(booking.end_time);
  const roomColor = room?.color || '#002B5C';
  const isPending = booking.status === 'PENDING';
  const isPriority = booking.is_priority;

  return (
    <div
      onClick={onClick}
      className={`group relative w-full p-3 rounded-lg transition-all cursor-pointer overflow-hidden ${
        isPending
          ? 'bg-amber-50/70 border-2 border-dashed border-amber-300 hover:border-amber-400 hover:shadow-sm'
          : 'bg-white border border-slate-200 shadow-sm hover:shadow-md'
      }`}
      style={{
        borderLeftWidth: '5px',
        borderLeftColor: isPending ? '#D97706' : roomColor,
      }}
    >
      {/* Badge de Prioridade ou Status */}
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-1.5">
          {isPriority && (
            <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-black px-1.5 py-0.2 rounded shadow-xs" title="Prioridade do Gabinete / Secretário">
              <Crown className="w-3 h-3 text-[#C59B27]" />
              Gabinete
            </span>
          )}
          {isPending && (
            <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.2 rounded border border-amber-300">
              <AlertCircle className="w-2.5 h-2.5" />
              Pendente
            </span>
          )}
          <h5 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-1 group-hover:text-[#002B5C] transition-colors">
            {booking.title}
          </h5>
        </div>

        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 flex-shrink-0">
          <Clock className="w-3 h-3 text-[#002B5C]" />
          {startTime} - {endTime}
        </span>
      </div>

      <div className="flex flex-col gap-1 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <User className="w-3 h-3 text-slate-400" />
          <span className="truncate font-medium text-slate-700">{booking.user_name}</span>
        </div>

        {booking.description && (
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <FileText className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{booking.description}</span>
          </div>
        )}
      </div>
    </div>
  );
};
