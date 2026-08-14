import React from 'react';
import { Booking, Room } from '../../types';
import { Clock, User, FileText } from 'lucide-react';
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

  return (
    <div
      onClick={onClick}
      className="group relative w-full p-3 rounded-lg border bg-white shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden"
      style={{
        borderLeftWidth: '4px',
        borderLeftColor: roomColor,
      }}
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <h5 className="text-xs sm:text-sm font-bold text-slate-800 line-clamp-1 group-hover:text-[#002B5C] transition-colors">
          {booking.title}
        </h5>
        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 flex-shrink-0">
          <Clock className="w-3 h-3 text-[#002B5C]" />
          {startTime} - {endTime}
        </span>
      </div>

      <div className="flex flex-col gap-1 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <User className="w-3 h-3 text-slate-400" />
          <span className="truncate font-medium text-slate-600">{booking.user_name}</span>
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
