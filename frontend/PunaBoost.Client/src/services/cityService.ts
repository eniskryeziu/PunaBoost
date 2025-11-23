import api from '@/lib/api';
import type { City } from '@/types';

export const cityService = {
  async getAll(): Promise<City[]> {
    const { data } = await api.get<City[]>('/city');
    return data;
  },

  async getByCountryId(countryId: number): Promise<City[]> {
    const { data } = await api.get<City[]>(`/city/country/${countryId}`);
    return data;
  },

  async getById(id: number): Promise<City> {
    const { data } = await api.get<City>(`/city/${id}`);
    return data;
  },

  async create(name: string, countryId: number): Promise<City> {
    const { data } = await api.post<City>('/city', { name, countryId });
    return data;
  },

  async update(id: number, name: string, countryId: number): Promise<City> {
    const { data } = await api.put<City>(`/city/${id}`, { name, countryId });
    return data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/city/${id}`);
  },
};

