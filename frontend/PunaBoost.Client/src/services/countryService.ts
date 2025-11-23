import api from '@/lib/api';
import type { Country } from '@/types';

export const countryService = {
  async getAll(): Promise<Country[]> {
    const { data } = await api.get<Country[]>('/country');
    return data;
  },

  async getById(id: number): Promise<Country> {
    const { data } = await api.get<Country>(`/country/${id}`);
    return data;
  },

  async create(name: string, code: string): Promise<Country> {
    const { data } = await api.post<Country>('/country', { name, code });
    return data;
  },

  async update(id: number, name: string, code: string): Promise<Country> {
    const { data } = await api.put<Country>(`/country/${id}`, { name, code });
    return data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/country/${id}`);
  },
};

