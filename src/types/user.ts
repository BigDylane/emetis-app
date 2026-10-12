export type UserRole = 'traveler' | 'host';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}
