export type ActivityLocation = "theme-park" | "main-resort";

export type ActivityType = "Beach" | "Theme park" | "Other";

export interface Activity {
  id: number;
  name: string;
  activityType: ActivityType;
  price: number;
  capacity: number | null;
  imageUrl: string;
  isPremium: boolean;
  createdAt: Date;
  updatedAt: Date;
}
