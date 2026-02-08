export type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";

export interface Booking {
  id: number;
  userId: number;
  roomId?: number;
  ferryScheduleId?: number;
  activityId?: number;
  status: BookingStatus;
  totalPrice: number;
  createdAt: Date;
  updatedAt: Date;
}
