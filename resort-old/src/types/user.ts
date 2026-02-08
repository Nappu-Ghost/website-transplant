export type UserRole = "USER" | "PREMIUM" | "OFFLINE" | "ADMIN";

export interface User {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  profileImage?: string;
  createdAt: Date;
  updatedAt: Date;
}
