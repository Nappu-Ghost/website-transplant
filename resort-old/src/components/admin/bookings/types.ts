// Define BookingStatus enum to match Prisma schema
export enum BookingStatus {
  PENDING = "PENDING",
  PAYMENT_COMPLETED = "PAYMENT_COMPLETED",
  CONFIRMED = "CONFIRMED",
  CHECKED_IN = "CHECKED_IN",
  CHECKED_OUT = "CHECKED_OUT",
  CANCELLED = "CANCELLED"
}

// Booking related interfaces
export interface Room {
  id: number;
  name: string;
  type: string;
  price: number;
  imageUrl: string;
  capacity: number;
  floorNumber: number;
  hotelId: number;
}

export interface Activity {
  id: number;
  name: string;
  activityType: string;
  price: number;
  imageUrl: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface BookingRoom {
  id: number;
  bookingId: number;
  roomId: number;
  room: Room;
}

export interface BookingActivity {
  id: number;
  bookingId: number;
  activityId: number;
  activity: Activity;
}

export interface FerryTicket {
  id: number;
  numberOfTickets: number;
  price: number;
  bookingId: number;
}

export interface Booking {
  id: number;
  userId: number;
  numberOfGuests: number;
  status: BookingStatus;
  totalPrice: number;
  startDate: string;
  endDate: string;
  isPremium: boolean;
  createdAt: string;
  updatedAt: string;
  user: User;
  rooms: BookingRoom[];
  activities: BookingActivity[];
  ferryTicket: FerryTicket | null;
}