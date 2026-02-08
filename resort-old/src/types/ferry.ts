export interface Ferry {
  id: number;
  name: string;
  capacity: number;
  schedules?: FerrySchedule[];
}

export interface FerrySchedule {
  id: number;
  ferryId: number;
  departure: Date;
  arrival: Date;
  route: string;
  price: number;
  available: boolean;
}
