// Types: Auth
export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  phone?: string;
  department?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  lastLoginAt?: string;
  createdAt: string;
}

export type UserRole =
  | 'admin'
  | 'purchasing'
  | 'purchasing_manager'
  | 'sales'
  | 'accountant'
  | 'logistics'
  | 'warehouse';

export interface LoginDto {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  expiresIn: number;
  user: Pick<User, 'id' | 'email' | 'fullName' | 'role' | 'department'>;
}
