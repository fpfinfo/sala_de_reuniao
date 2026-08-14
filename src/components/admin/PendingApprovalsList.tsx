import React, { useState } from 'react';
import { Booking, Room } from '../../types';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { Check, X, Clock, Calendar, User, FileText, AlertCircle, Sparkles } from 'lucide-react';
import { formatDateBr, formatTimeBr } from '../../utils/dateUtils';

interface PendingApprovalsListProps {
  pendingBookings: Booking[];
  rooms: Room[];
  onApprove: (bookingId: string) => Promise<void>;
  onReject: (bookingId: string, reason: string) => Promise<void>;
  onNewBookingClick: () => void;
}

export const PendingApprovalsList: React.FC<PendingApprovalsListProps> = ({
  pendingBookings,
  rooms,
  onApprove,
  onReject,
}) => {
  const [rejectingBooking, setRejectingBooking] = useState<Booking | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>(
    'Horário reservado para agenda prioritária do Gabinete / Secretário da SEPLAN.'
  );
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const handleConfirmReject = async () => {
    if (!rejectingBooking) return;
    setIsProcessing(true);
    try {
      await onReject(rejectingBooking.id, rejectionReason);
      setRejectingBooking(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApprove = async (id: string) => {
    setIsProcessing(true);
    try {
      await onApprove(id);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Cabeçalho da Fila de Aprovação */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-tjpa-navy">
              Fila de Aprovações de Agendamentos
            </h3>
            <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-0.5 rounded-full border border-amber-300">
              {pendingBookings.length} {pendingBookings.length === 1 ? 'pendente' : 'pendentes'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Como Administrador da SEPLAN, aprove ou recuse solicitações de servidores, garantindo prioridade para o Gabinete do Secretário.
          </p>
        </div>
      </div>

      {pendingBookings.length === 0 ? (
        <div className="bg-white p-12 rounded-xl shadow-sm border border-slate-200 text-center flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <h4 className="text-base font-bold text-slate-800">Tudo em dia!</h4>
          <p className="text-xs text-slate-500 max-w-sm mt-1">
            Não há nenhuma solicitação de agendamento aguardando análise no momento.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {pendingBookings.map((booking) => {
            const room = rooms.find((r) => r.id === booking.room_id);

            return (
              <div
                key={booking.id}
                className="bg-white rounded-xl border border-amber-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center md:justify-between gap-4 relative overflow-hidden"
                style={{
                  borderLeftWidth: '5px',
                  borderLeftColor: room?.color || '#002B5C',
                }}
              >
                {/* Detalhes do Pedido */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="gold" size="sm" dot>
                      Aguardando Sua Aprovação
                    </Badge>
                    <span className="text-xs font-bold text-slate-800">
                      {room?.name || 'Sala SEPLAN'}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-slate-900 mb-1">
                    {booking.title}
                  </h4>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 mb-3">
                    <span className="flex items-center gap-1.5 font-medium text-slate-700">
                      <User className="w-3.5 h-3.5 text-[#002B5C]" />
                      {booking.user_name} ({booking.user_email})
                    </span>

                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-[#002B5C]" />
                      {formatDateBr(booking.start_time)}
                    </span>

                    <span className="flex items-center gap-1 font-bold text-[#002B5C] bg-blue-50 px-2 py-0.5 rounded">
                      <Clock className="w-3.5 h-3.5" />
                      {formatTimeBr(booking.start_time)} às {formatTimeBr(booking.end_time)}
                    </span>
                  </div>

                  {booking.description && (
                    <div className="flex items-start gap-1.5 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 max-w-2xl">
                      <FileText className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                      <span>{booking.description}</span>
                    </div>
                  )}
                </div>

                {/* Ações de Aprovar / Recusar */}
                <div className="flex items-center gap-2 flex-shrink-0 border-t md:border-t-0 pt-3 md:pt-0">
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => {
                      setRejectingBooking(booking);
                      setRejectionReason(
                        'Horário reservado para agenda prioritária do Gabinete / Secretário da SEPLAN.'
                      );
                    }}
                    leftIcon={<X className="w-4 h-4" />}
                    disabled={isProcessing}
                  >
                    Recusar
                  </Button>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleApprove(booking.id)}
                    leftIcon={<Check className="w-4 h-4" />}
                    className="bg-emerald-600 hover:bg-emerald-700 font-bold"
                    isLoading={isProcessing}
                  >
                    Aprovar Reserva
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Justificativa de Recusa */}
      <Modal
        isOpen={!!rejectingBooking}
        onClose={() => setRejectingBooking(null)}
        title="Recusar Solicitação de Sala"
        subtitle="Informe a justificativa institucional para o solicitante"
        maxWidth="md"
      >
        <div className="flex flex-col gap-4">
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-xs text-slate-700">
            <AlertCircle className="w-4 h-4 text-tjpa-red flex-shrink-0 mt-0.5" />
            <p>
              Ao recusar, o solicitante <strong>{rejectingBooking?.user_name}</strong> será notificado com a justificativa informada abaixo.
            </p>
          </div>

          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
              Motivo da Recusa / Justificativa *
            </label>
            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white p-3 text-xs text-slate-800 focus:outline-none focus:ring-4 focus:ring-tjpa-red/20 focus:border-tjpa-red"
              placeholder="Ex: Horário reservado para reunião com o Secretário de Planejamento."
              required
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setRejectingBooking(null)}
              disabled={isProcessing}
            >
              Voltar
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={handleConfirmReject}
              isLoading={isProcessing}
              className="font-bold"
            >
              Confirmar Recusa
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
