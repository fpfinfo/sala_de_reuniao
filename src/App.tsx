import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from './context/AuthContext';
import { useToast } from './context/ToastContext';
import { Room, Booking } from './types';
import { roomsService } from './services/roomsService';
import { bookingsService } from './services/bookingsService';
import { getTodayString } from './utils/dateUtils';
import { Header } from './components/layout/Header';
import { Shell } from './components/layout/Shell';
import { RoomFilterBar } from './components/dashboard/RoomFilterBar';
import { DailyTimelineGrid } from './components/dashboard/DailyTimelineGrid';
import { MyBookingsList } from './components/bookings/MyBookingsList';
import { PendingApprovalsList } from './components/admin/PendingApprovalsList';
import { AdminSettingsPage } from './components/admin/AdminSettingsPage';
import { BookingModal } from './components/bookings/BookingModal';
import { BookingDetailsModal } from './components/bookings/BookingDetailsModal';
import { CancelConfirmModal } from './components/bookings/CancelConfirmModal';
import { LoginForm } from './components/auth/LoginForm';
import { ToastContainer } from './components/ui/ToastContainer';

export const AppContent: React.FC = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState<'timeline' | 'my-bookings' | 'pending-approvals' | 'settings'>('timeline');
  const [selectedDate, setSelectedDate] = useState<string>(getTodayString());
  const [selectedRoomId, setSelectedRoomId] = useState<string | 'ALL'>('ALL');

  const [rooms, setRooms] = useState<Room[]>([]);
  const [dailyBookings, setDailyBookings] = useState<Booking[]>([]);
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [pendingBookings, setPendingBookings] = useState<Booking[]>([]);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);

  // Modais
  const [isBookingModalOpen, setIsBookingModalOpen] = useState<boolean>(false);
  const [bookingModalInitialRoom, setBookingModalInitialRoom] = useState<string | undefined>();
  const [bookingModalInitialStart, setBookingModalInitialStart] = useState<string | undefined>();

  const [selectedBookingForDetails, setSelectedBookingForDetails] = useState<Booking | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState<boolean>(false);

  const [isCancelModalOpen, setIsCancelModalOpen] = useState<boolean>(false);
  const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null);
  const [isCancelling, setIsCancelling] = useState<boolean>(false);

  const isMaster = user?.role === 'MASTER_ADMIN' || user?.email === 'fabio.freitas@tjpa.jus.br';
  const isAdmin = isMaster || user?.role === 'ADMIN';

  // Carrega salas da SEPLAN
  const loadRooms = useCallback(async () => {
    if (isAuthenticated) {
      const data = await roomsService.getRooms();
      setRooms(data);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  // Carrega agendamentos
  const loadBookings = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoadingData(true);
    try {
      const [dayData, myData, pendingData] = await Promise.all([
        bookingsService.getBookingsByDate(selectedDate),
        bookingsService.getMyBookings(),
        bookingsService.getPendingBookings(),
      ]);
      setDailyBookings(dayData);
      setMyBookings(myData);
      setPendingBookings(pendingData);
    } catch (err: any) {
      console.error('Erro ao carregar agendamentos:', err);
    } finally {
      setIsLoadingData(false);
    }
  }, [isAuthenticated, selectedDate]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  // Ações de Administrador
  const handleApproveBooking = async (bookingId: string) => {
    try {
      await bookingsService.approveBooking(bookingId);
      addToast({
        type: 'success',
        title: 'Agendamento Aprovado!',
        message: 'A reserva foi confirmada e o horário está garantido na grade.',
      });
      loadBookings();
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Erro ao aprovar',
        message: err.message,
      });
    }
  };

  const handleRejectBooking = async (bookingId: string, reason: string) => {
    try {
      await bookingsService.rejectBooking(bookingId, reason);
      addToast({
        type: 'info',
        title: 'Solicitação Recusada',
        message: 'A solicitação foi rejeitada e a justificativa foi registrada.',
      });
      loadBookings();
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Erro ao recusar',
        message: err.message,
      });
    }
  };

  // Agendamento Rápido
  const handleQuickBooking = (roomId: string, timeSlot: string) => {
    setBookingModalInitialRoom(roomId);
    setBookingModalInitialStart(timeSlot);
    setIsBookingModalOpen(true);
  };

  const handleOpenNewBooking = () => {
    setBookingModalInitialRoom(selectedRoomId === 'ALL' ? (rooms[0]?.id || '') : selectedRoomId);
    setBookingModalInitialStart('09:00');
    setIsBookingModalOpen(true);
  };

  // Abrir Modal de Detalhes ao Clicar no Card
  const handleBookingCardClick = (booking: Booking) => {
    setSelectedBookingForDetails(booking);
    setIsDetailsModalOpen(true);
  };

  const handleOpenCancelModal = (booking: Booking) => {
    setBookingToCancel(booking);
    setIsCancelModalOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!bookingToCancel) return;
    setIsCancelling(true);
    try {
      await bookingsService.cancelBooking(bookingToCancel.id);
      addToast({
        type: 'success',
        title: 'Agendamento cancelado',
        message: 'A reserva foi cancelada e o horário está liberado.',
      });
      setIsCancelModalOpen(false);
      setBookingToCancel(null);
      loadBookings();
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Erro ao cancelar',
        message: err.message || 'Não foi possível cancelar o agendamento.',
      });
    } finally {
      setIsCancelling(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#002B5C] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C59B27] mx-auto mb-4" />
          <p className="text-white text-sm font-medium">Carregando sistema SEPLAN...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <LoginForm />
        <ToastContainer />
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F1F3F6]">
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onNewBookingClick={handleOpenNewBooking}
        pendingCount={pendingBookings.length}
      />

      <Shell>
        {activeTab === 'timeline' ? (
          <div>
            <RoomFilterBar
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              rooms={rooms}
              selectedRoomId={selectedRoomId}
              onRoomSelect={setSelectedRoomId}
            />

            {isLoadingData ? (
              <div className="bg-white p-12 rounded-xl shadow-sm border border-slate-200 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#002B5C] mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-500">
                  Atualizando grade de horários...
                </p>
              </div>
            ) : (
              <DailyTimelineGrid
                rooms={rooms}
                bookings={dailyBookings}
                selectedRoomId={selectedRoomId}
                selectedDate={selectedDate}
                onQuickBooking={handleQuickBooking}
                onBookingClick={handleBookingCardClick}
              />
            )}
          </div>
        ) : activeTab === 'pending-approvals' && isAdmin ? (
          <PendingApprovalsList
            pendingBookings={pendingBookings}
            rooms={rooms}
            onApprove={handleApproveBooking}
            onReject={handleRejectBooking}
            onNewBookingClick={handleOpenNewBooking}
          />
        ) : activeTab === 'settings' && isAdmin ? (
          <AdminSettingsPage
            rooms={rooms}
            onRoomsUpdated={loadRooms}
          />
        ) : (
          <MyBookingsList
            bookings={myBookings}
            rooms={rooms}
            onCancelClick={handleOpenCancelModal}
            onNewBookingClick={handleOpenNewBooking}
          />
        )}
      </Shell>

      {/* Modal de Agendamento */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        rooms={rooms}
        selectedDate={selectedDate}
        initialRoomId={bookingModalInitialRoom}
        initialStartTime={bookingModalInitialStart}
        onBookingSuccess={loadBookings}
      />

      {/* Modal de Detalhes Completos da Solicitação ao Clicar no Card */}
      <BookingDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedBookingForDetails(null);
        }}
        booking={selectedBookingForDetails}
        room={rooms.find((r) => r.id === selectedBookingForDetails?.room_id)}
        currentUser={user}
        onApprove={handleApproveBooking}
        onReject={handleRejectBooking}
        onCancel={handleOpenCancelModal}
      />

      {/* Modal de Confirmação de Cancelamento */}
      <CancelConfirmModal
        isOpen={isCancelModalOpen}
        onClose={() => {
          setIsCancelModalOpen(false);
          setBookingToCancel(null);
        }}
        booking={bookingToCancel}
        room={rooms.find((r) => r.id === bookingToCancel?.room_id)}
        onConfirm={handleConfirmCancel}
        isLoading={isCancelling}
      />

      <ToastContainer />
    </div>
  );
};

export const App: React.FC = () => {
  return <AppContent />;
};

export default App;
