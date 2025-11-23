import api from '@/lib/api';
import type { AuthResponse, LoginDto } from '@/types';

export const authService = {
  async login(credentials: LoginDto): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/account/login', credentials);
    return data;
  },

  async registerCandidate(formData: FormData): Promise<{ message: string; email: string; confirmationCode: string }> {
    const { data } = await api.post('/account/register/candidate', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },

  async registerCompany(formData: FormData): Promise<{ message: string; email: string; confirmationCode: string }> {
    const { data } = await api.post('/account/register/company', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },

  async verifyEmail(email: string, code: string): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/account/email-verification', null, {
      params: { email, code },
    });
    return data;
  },
};

