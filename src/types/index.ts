export type UserRole = 'MASTER_ADMIN' | 'ADMIN' | 'USER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
}

export interface Room {
  id: string;
  name: string;
  capacity: number;
  location: string;
  description: string;
  color: string;
  equipment?: string[];
}

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'CANCELLED';

export interface Booking {
  id: string;
  room_id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  title: string;
  description?: string;
  start_time: string; // ISO String
  end_time: string;   // ISO String
  status: BookingStatus;
  is_priority?: boolean;
  rejection_reason?: string;
  approved_by?: string;
  approved_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateBookingDTO {
  room_id: string;
  title: string;
  description?: string;
  date: string;       // YYYY-MM-DD
  start_time: string; // HH:mm
  end_time: string;   // HH:mm
  is_priority?: boolean;
}

export interface ConflictCheckResult {
  hasConflict: boolean;
  conflictingBooking?: Booking;
  message?: string;
  isPendingConflict?: boolean;
}
