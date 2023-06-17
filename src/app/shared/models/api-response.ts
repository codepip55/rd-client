import { User } from './user.model';

export class AuthApiResponse {
  user: User;
  token: string;
  expiresIn: number;
}