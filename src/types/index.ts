export interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN' | 'SEPLAN_MANAGER';
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

export interface Booking {
  id: string;
  room_id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  title: string;
  description?: string;
  start_time: string; // ISO String (ex: 2026-08-14T09:00:00.000Z)
  end_time: string;   // ISO String (ex: 2026-08-14T10:30:00.000Z)
  status: 'CONFIRMED' | 'CANCELLED';
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
}

export interface ConflictCheckResult {
  hasConflict: boolean;
  conflictingBooking?: Booking;
  message?: string;
}
