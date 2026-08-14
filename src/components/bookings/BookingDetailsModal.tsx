import React, { useState } from 'react';
import { Booking, Room, User } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import {
  Calendar,
  Clock,
  User as UserIcon,
  MapPin,
  Users,
  FileText,
  Crown,
  AlertCircle,
  Trash2,
  Check,
  X,
} from 'lucide-react';
import { formatDateBr, formatTimeBr } from '../../utils/dateUtils';

interface BookingDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
  room?: Room;
  currentUser: User | null;
  onApprove?: (bookingId: string) => Promise<void>;
  onReject?: (bookingId: string, reason: string) => Promise<void>;
  onCancel?: (booking: Booking) => void;
}

export const BookingDetailsModal: React.FC<BookingDetailsModalProps> = ({
  isOpen,
  onClose,
  booking,
  room,
  currentUser,
  onApprove,
  onReject,
  onCancel,
}) => {
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState(
    'Horário reservado para agenda prioritária do Gabinete / Secretário da SEPLAN.'
  );
  const [isProcessing, setIsProcessing] = useState(false);

  if (!booking) return null;

  const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'MASTER_ADMIN';
  const isOwner = currentUser?.id === booking.user_id || currentUser?.email.toLowerCase() === booking.user_email.toLowerCase();
  const canCancel = (isOwner || isAdmin) && (booking.status === 'CONFIRMED' || booking.status === 'PENDING');
  const canAdminDecide = isAdmin && booking.status === 'PENDING';

  const startTime = formatTimeBr(booking.start_time);
  const endTime = formatTimeBr(booking.end_time);

  // Calcula duração
  const startMs = new Date(booking.start_time).getTime();
  const endMs = new Date(booking.end_time).getTime();
  const diffMinutes = Math.round((endMs - startMs) / (1000 * 60));
  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;
  const durationStr = hours > 0 ? `${hours}h${minutes > 0 ? ` ${minutes}min` : ''}` : `${minutes} min`;

  const handleApprove = async () => {
    if (!onApprove) return;
    setIsProcessing(true);
    try {
      await onApprove(booking.id);
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmReject = async () => {
    if (!onReject) return;
    setIsProcessing(true);
    try {
      await onReject(booking.id, rejectionReason);
      setIsRejecting(false);
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = () => {
    switch (booking.status) {
      case 'CONFIRMED':
        return (
          <Badge variant="green" size="md" dot>
            Reserva Confirmada
          </Badge>
        );
      case 'PENDING':
        return (
          <Badge variant="gold" size="md" dot>
            Pendente de Aprovação
          </Badge>
        );
      case 'REJECTED':
        return (
          <Badge variant="red" size="md" dot>
            Solicitação Recusada
          </Badge>
        );
      case 'CANCELLED':
        return (
          <Badge variant="gray" size="md" dot>
            Cancelado
          </Badge>
        );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Detalhes do Agendamento"
      subtitle={`Informações completas da reserva na ${room?.name || 'SEPLAN'}`}
      maxWidth="lg"
    >
      <div className="flex flex-col gap-5">
        {/* Status e Tags de Prioridade */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center gap-2">
            {getStatusBadge()}
            {booking.is_priority && (
              <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 border border-amber-300 text-xs font-black px-2 py-0.5 rounded-full shadow-xs">
                <Crown className="w-3.5 h-3.5 text-[#C59B27]" />
                Prioridade Gabinete / Secretário
              </span>
            )}
          </div>

          <span className="text-xs font-bold text-slate-500 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
            Duração: {durationStr}
          </span>
        </div>

        {/* Título da Reunião */}
        <div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Pauta / Título da Reunião
          </span>
          <h3 className="text-lg font-black text-slate-900 leading-snug">
            {booking.title}
          </h3>
        </div>

        {/* Grid de Informações: Sala, Data, Horário e Solicitante */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Sala */}
          <div className="p-3.5 rounded-xl bg-white border border-slate-200 flex items-start gap-3 shadow-xs">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-white font-bold"
              style={{ backgroundColor: room?.color || '#002B5C' }}
            >
              <Users className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Sala de Reunião</span>
              <span className="text-xs font-bold text-slate-800">{room?.name || 'Sala SEPLAN'}</span>
              <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-[#C59B27]" />
                {room?.location} • Até {room?.capacity} pessoas
              </span>
            </div>
          </div>

          {/* Data e Horário */}
          <div className="p-3.5 rounded-xl bg-white border border-slate-200 flex items-start gap-3 shadow-xs">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#002B5C] flex items-center justify-center flex-shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Data e Horário</span>
              <span className="text-xs font-bold text-slate-800">{formatDateBr(booking.start_time)}</span>
              <span className="text-[11px] text-[#002B5C] font-black flex items-center gap-1 mt-0.5">
                <Clock className="w-3 h-3" />
                {startTime} às {endTime}
              </span>
            </div>
          </div>

          {/* Solicitante */}
          <div className="p-3.5 rounded-xl bg-white border border-slate-200 flex items-start gap-3 shadow-xs sm:col-span-2">
            <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center flex-shrink-0">
              <UserIcon className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Solicitante Responsável</span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900">{booking.user_name}</span>
                <span className="text-[11px] text-slate-500 font-medium">({booking.user_email})</span>
              </div>
              <span className="text-[11px] text-slate-500 mt-0.5">
                Lotação: Secretaria de Planejamento, Coordenação e Finanças (SEPLAN)
              </span>
            </div>
          </div>
        </div>

        {/* Descrição / Observações */}
        {booking.description && (
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              Descrição / Observações / Participantes:
            </span>
            <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
              {booking.description}
            </p>
          </div>
        )}

        {/* Justificativa de Recusa se houver */}
        {booking.status === 'REJECTED' && booking.rejection_reason && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-xs text-red-900">
            <AlertCircle className="w-5 h-5 text-tjpa-red flex-shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold block text-sm">Justificativa da Administração:</strong>
              <p className="mt-0.5 leading-relaxed">{booking.rejection_reason}</p>
            </div>
          </div>
        )}

        {/* Modo de Recusa para o Admin */}
        {isRejecting ? (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex flex-col gap-3">
            <label className="text-xs font-bold text-red-900 uppercase">
              Informe a justificativa da recusa para o solicitante:
            </label>
            <textarea
              rows={2}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full rounded-lg border border-red-300 bg-white p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-tjpa-red"
              required
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsRejecting(false)}
                disabled={isProcessing}
              >
                Voltar
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleConfirmReject}
                isLoading={isProcessing}
                className="font-bold"
              >
                Confirmar Recusa
              </Button>
            </div>
          </div>
        ) : null}

        {/* Rodapé e Ações Contextuais */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
          <div>
            {canCancel && onCancel && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  onClose();
                  onCancel(booking);
                }}
                className="text-tjpa-red hover:bg-red-50 hover:text-tjpa-red font-semibold text-xs"
                leftIcon={<Trash2 className="w-4 h-4" />}
              >
                Cancelar Agendamento
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {canAdminDecide && !isRejecting && (
              <>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setIsRejecting(true)}
                  leftIcon={<X className="w-4 h-4" />}
                  disabled={isProcessing}
                >
                  Recusar
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleApprove}
                  leftIcon={<Check className="w-4 h-4" />}
                  className="bg-emerald-600 hover:bg-emerald-700 font-bold"
                  isLoading={isProcessing}
                >
                  Aprovar Agendamento
                </Button>
              </>
            )}

            <Button variant="secondary" size="md" onClick={onClose}>
              Fechar
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
