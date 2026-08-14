import React from 'react';
import { Room } from '../../types';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Users, MapPin } from 'lucide-react';
import { formatRelativeDateLabel, formatDateBr, getNextDay, getPreviousDay, getTodayString } from '../../utils/dateUtils';
import { Button } from '../ui/Button';

interface RoomFilterBarProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  rooms: Room[];
  selectedRoomId: string | 'ALL';
  onRoomSelect: (roomId: string | 'ALL') => void;
}

export const RoomFilterBar: React.FC<RoomFilterBarProps> = ({
  selectedDate,
  onDateChange,
  rooms,
  selectedRoomId,
  onRoomSelect,
}) => {
  const isTodayDate = selectedDate === getTodayString();

  return (
    <div className="flex flex-col gap-4 mb-6">
      {/* Barra de Controle de Datas */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Navegação de Data */}
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onDateChange(getPreviousDay(selectedDate))}
            leftIcon={<ChevronLeft className="w-4 h-4" />}
            title="Dia Anterior"
          />

          <Button
            variant={isTodayDate ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => onDateChange(getTodayString())}
            className="text-xs font-bold"
          >
            Hoje
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => onDateChange(getNextDay(selectedDate))}
            rightIcon={<ChevronRight className="w-4 h-4" />}
            title="Próximo Dia"
          />

          <div className="ml-2 flex items-center gap-2 pl-3 border-l border-slate-200">
            <CalendarIcon className="w-4 h-4 text-[#002B5C]" />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-[#002B5C] capitalize">
                {formatRelativeDateLabel(selectedDate)}
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                {formatDateBr(selectedDate)}
              </span>
            </div>
          </div>
        </div>

        {/* Input de Data Personalizada */}
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-slate-600 hidden sm:inline">
            Ir para data:
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => e.target.value && onDateChange(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#002B5C]/20 focus:border-[#002B5C]"
          />
        </div>
      </div>

      {/* Cartões Informativos das 3 Salas da SEPLAN */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {rooms.map((room) => {
          const isSelected = selectedRoomId === room.id || selectedRoomId === 'ALL';
          return (
            <div
              key={room.id}
              onClick={() => onRoomSelect(selectedRoomId === room.id ? 'ALL' : room.id)}
              className={`p-4 rounded-xl border transition-all cursor-pointer bg-white ${
                isSelected
                  ? 'border-slate-300 shadow-sm ring-2 ring-[#002B5C]/10'
                  : 'border-slate-200 opacity-60 hover:opacity-100'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3.5 h-3.5 rounded-full shadow-sm"
                    style={{ backgroundColor: room.color }}
                  />
                  <h4 className="text-sm font-bold text-slate-800">{room.name}</h4>
                </div>
                <div className="flex items-center gap-1 text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                  <Users className="w-3.5 h-3.5 text-slate-500" />
                  <span>{room.capacity} lug.</span>
                </div>
              </div>

              <p className="text-xs text-slate-500 line-clamp-2 mb-2">{room.description}</p>

              <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                <MapPin className="w-3 h-3 text-[#C59B27]" />
                <span>{room.location}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
