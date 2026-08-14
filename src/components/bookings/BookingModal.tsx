import React, { useState, useEffect } from 'react';
import { Room, Booking, CreateBookingDTO } from '../../types';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { bookingsService } from '../../services/bookingsService';
import { validateBookingConflict } from '../../utils/conflictValidator';
import { combineDateAndTime, generateTimeSlots } from '../../utils/dateUtils';
import { AlertCircle, CheckCircle2, Clock, Calendar, Users, MapPin, Crown, ShieldAlert } from 'lucide-react';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  rooms: Room[];
  selectedDate: string;
  initialRoomId?: string;
  initialStartTime?: string;
  onBookingSuccess: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  rooms,
  selectedDate,
  initialRoomId,
  initialStartTime,
  onBookingSuccess,
}) => {
  const { addToast } = useToast();
  const { user } = useAuth();

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'MASTER_ADMIN';

  const [roomId, setRoomId] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [date, setDate] = useState<string>(selectedDate);
  const [startTime, setStartTime] = useState<string>('09:00');
  const [endTime, setEndTime] = useState<string>('10:00');
  const [description, setDescription] = useState<string>('');
  const [isPriority, setIsPriority] = useState<boolean>(false);
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [conflictMessage, setConflictMessage] = useState<string | null>(null);
  const [isPendingConflict, setIsPendingConflict] = useState<boolean>(false);
  const [existingDayBookings, setExistingDayBookings] = useState<Booking[]>([]);

  const availableTimeSlots = generateTimeSlots(8, 19, 30);

  // Inicializa valores ao abrir
  useEffect(() => {
    if (isOpen) {
      setRoomId(initialRoomId || (rooms.length > 0 ? rooms[0].id : ''));
      setDate(selectedDate);
      
      const start = initialStartTime || '09:00';
      setStartTime(start);

      const [h, m] = start.split(':').map(Number);
      const endHour = Math.min(h + 1, 19).toString().padStart(2, '0');
      setEndTime(`${endHour}:${m.toString().padStart(2, '0')}`);

      setTitle('');
      setDescription('');
      setIsPriority(false);
      setConflictMessage(null);
      setIsPendingConflict(false);
    }
  }, [isOpen, initialRoomId, initialStartTime, selectedDate, rooms]);

  // Carrega agendamentos existentes da data para validação
  useEffect(() => {
    if (isOpen && date) {
      bookingsService.getBookingsByDate(date).then((data) => {
        setExistingDayBookings(data);
      });
    }
  }, [isOpen, date]);

  // Validação reativa de conflito em tempo real
  useEffect(() => {
    if (!roomId || !date || !startTime || !endTime) {
      setConflictMessage(null);
      setIsPendingConflict(false);
      return;
    }

    const startIso = combineDateAndTime(date, startTime);
    const endIso = combineDateAndTime(date, endTime);

    const result = validateBookingConflict(
      roomId,
      startIso,
      endIso,
      existingDayBookings,
      undefined,
      isPriority
    );

    if (result.hasConflict) {
      setConflictMessage(result.message || 'Horário conflitante com outra reunião.');
      setIsPendingConflict(!!result.isPendingConflict);
    } else {
      setConflictMessage(null);
      setIsPendingConflict(false);
    }
  }, [roomId, date, startTime, endTime, existingDayBookings, isPriority]);

  const selectedRoom = rooms.find((r) => r.id === roomId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      addToast({
        type: 'error',
        title: 'Título obrigatório',
        message: 'Por favor, informe o título ou pauta da reunião.',
      });
      return;
    }

    if (conflictMessage && (!isPriority || !isPendingConflict)) {
      addToast({
        type: 'error',
        title: 'Conflito detectado',
        message: conflictMessage,
      });
      return;
    }

    setIsLoading(true);

    try {
      const dto: CreateBookingDTO = {
        room_id: roomId,
        title: title.trim(),
        description: description.trim(),
        date,
        start_time: startTime,
        end_time: endTime,
        is_priority: isPriority,
      };

      await bookingsService.createBooking(dto);

      if (isAdmin) {
        addToast({
          type: 'success',
          title: isPriority ? 'Reserva Prioritária Auto-confirmada!' : 'Agendamento Auto-confirmado!',
          message: `Horário reservado com sucesso para ${selectedRoom?.name}.`,
        });
      } else {
        addToast({
          type: 'info',
          title: 'Solicitação Enviada!',
          message: 'Seu agendamento está pendente de aprovação pelo Administrador da SEPLAN.',
          duration: 6000,
        });
      }

      onBookingSuccess();
      onClose();
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Falha no agendamento',
        message: err.message || 'Ocorreu um erro ao tentar salvar a reserva.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Novo Agendamento de Sala"
      subtitle="Preencha os detalhes da reunião para a SEPLAN"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Aviso de Perfil */}
        {isAdmin ? (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <p>
              <strong>Perfil Administrador:</strong> Seu agendamento será <strong>auto-confirmado imediatamente</strong> e o horário ficará garantido na grade oficial.
            </p>
          </div>
        ) : (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800 flex items-start gap-2">
            <Clock className="w-4 h-4 text-[#002B5C] flex-shrink-0 mt-0.5" />
            <p>
              <strong>Atenção:</strong> Sua reserva será enviada com status <strong>Pendente de Aprovação</strong> para que a administração da SEPLAN valide a disponibilidade de pauta e prioridade do Gabinete.
            </p>
          </div>
        )}

        {/* Título da Reunião */}
        <Input
          label="Título da Reunião / Pauta *"
          placeholder="Ex: Alinhamento Estratégico SEPLAN"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          autoFocus
        />

        {/* Seleção de Sala */}
        <div className="flex flex-col gap-1.5 text-left">
          <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
            Sala de Reunião *
          </label>
          <select
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:ring-4 focus:ring-[#002B5C]/20 focus:border-[#002B5C]"
          >
            {rooms.map((room) => (
              <option key={room.id} value={room.id}>
                {room.name} — (Capacidade: {room.capacity} pessoas)
              </option>
            ))}
          </select>
        </div>

        {/* Informações da Sala Selecionada */}
        {selectedRoom && (
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs flex flex-col gap-1 text-slate-600">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1 font-semibold text-slate-700">
                <Users className="w-3.5 h-3.5 text-[#002B5C]" />
                Capacidade: {selectedRoom.capacity} pessoas
              </span>
              <span className="flex items-center gap-1 font-medium text-slate-500">
                <MapPin className="w-3.5 h-3.5 text-[#C59B27]" />
                {selectedRoom.location}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">{selectedRoom.description}</p>
          </div>
        )}

        {/* Data e Horários */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#002B5C]" />
              Data *
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#002B5C]"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#002B5C]" />
              Início *
            </label>
            <select
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#002B5C]"
            >
              {availableTimeSlots.slice(0, -1).map((time) => (
                <option key={`start-${time}`} value={time}>
                  {time}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#002B5C]" />
              Término *
            </label>
            <select
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#002B5C]"
            >
              {availableTimeSlots.map((time) => (
                <option key={`end-${time}`} value={time}>
                  {time}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Opção de Reserva Prioritária do Gabinete / Secretário (Exclusivo Admin) */}
        {isAdmin && (
          <div className="p-3 rounded-lg bg-amber-50 border border-amber-300 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Crown className="w-4 h-4 text-[#C59B27] flex-shrink-0" />
              <div>
                <span className="text-xs font-bold text-amber-950 block">
                  Reserva Prioritária do Gabinete / Secretário
                </span>
                <span className="text-[11px] text-amber-800">
                  Garante confirmação imediata e sobrepõe solicitações pendentes no horário.
                </span>
              </div>
            </div>
            <input
              type="checkbox"
              id="priority-checkbox"
              checked={isPriority}
              onChange={(e) => setIsPriority(e.target.checked)}
              className="w-4 h-4 rounded text-[#C59B27] focus:ring-[#C59B27] cursor-pointer"
            />
          </div>
        )}

        {/* Alertas de Conflito */}
        {conflictMessage && (!isPriority || !isPendingConflict) ? (
          <div className="p-3 rounded-lg bg-red-50 border border-tjpa-red text-xs text-tjpa-red flex items-start gap-2 animate-shake">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span className="font-medium">{conflictMessage}</span>
          </div>
        ) : isPriority && isPendingConflict ? (
          <div className="p-3 rounded-lg bg-amber-100 border border-amber-400 text-xs text-amber-900 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5 text-[#C59B27]" />
            <span>
              <strong>Atenção:</strong> A reserva prioritária do Secretário irá cancelar automaticamente a solicitação pendente existente neste horário.
            </span>
          </div>
        ) : (
          <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>Horário livre para agendamento!</span>
          </div>
        )}

        {/* Descrição */}
        <div className="flex flex-col gap-1.5 text-left">
          <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
            Descrição / Participantes (Opcional)
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ex: Pauta da reunião, participantes convidados ou equipamentos."
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-4 focus:ring-[#002B5C]/20 focus:border-[#002B5C] resize-none"
          />
        </div>

        {/* Botões do Rodapé */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            disabled={!!conflictMessage && (!isPriority || !isPendingConflict)}
            className="bg-[#002B5C] hover:bg-[#001E42] font-bold"
          >
            {isAdmin ? 'Agendar e Auto-confirmar' : 'Enviar Solicitação'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
