import React from 'react';
import { Booking, Room } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { AlertTriangle, Clock, Calendar } from 'lucide-react';
import { formatDateBr, formatTimeBr } from '../../utils/dateUtils';

interface CancelConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
  room?: Room;
  onConfirm: () => void;
  isLoading: boolean;
}

export const CancelConfirmModal: React.FC<CancelConfirmModalProps> = ({
  isOpen,
  onClose,
  booking,
  room,
  onConfirm,
  isLoading,
}) => {
  if (!booking) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cancelar Agendamento"
      subtitle="Confirme o cancelamento da reserva da sala"
      maxWidth="md"
    >
      <div className="flex flex-col gap-4">
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 text-xs text-slate-700">
          <AlertTriangle className="w-5 h-5 text-tjpa-red flex-shrink-0" />
          <p>
            Você tem certeza que deseja cancelar esta reserva? O horário será liberado imediatamente para outros servidores da SEPLAN.
          </p>
        </div>

        {/* Detalhes do Agendamento */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col gap-2 text-xs">
          <h4 className="font-bold text-sm text-[#002B5C]">{booking.title}</h4>
          
          <div className="flex items-center gap-2 text-slate-600">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: room?.color || '#002B5C' }}
            />
            <span className="font-semibold">{room?.name || 'Sala SEPLAN'}</span>
          </div>

          <div className="flex items-center gap-4 text-slate-500 pt-2 border-t border-slate-200">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#002B5C]" />
              {formatDateBr(booking.start_time)}
            </span>
            <span className="flex items-center gap-1 font-semibold text-slate-700">
              <Clock className="w-3.5 h-3.5 text-[#002B5C]" />
              {formatTimeBr(booking.start_time)} - {formatTimeBr(booking.end_time)}
            </span>
          </div>
        </div>

        {/* Botões */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
            Voltar
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={onConfirm}
            isLoading={isLoading}
            className="font-bold"
          >
            Confirmar Cancelamento
          </Button>
        </div>
      </div>
    </Modal>
  );
};
