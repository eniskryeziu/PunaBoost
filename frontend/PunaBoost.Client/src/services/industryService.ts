import api from '@/lib/api';
import type { Industry } from '@/types';

export const industryService = {
  async getAll(): Promise<Industry[]> {
    const { data } = await api.get<Industry[]>('/industry');
    return data;
  },

  async getById(id: number): Promise<Industry> {
    const { data } = await api.get<Industry>(`/industry/${id}`);
    return data;
  },

  async create(name: string): Promise<Industry> {
    const { data } = await api.post<Industry>('/industry', { name });
    return data;
  },

  async update(id: number, name: string): Promise<Industry> {
    const { data } = await api.put<Industry>(`/industry/${id}`, { name });
    return data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/industry/${id}`);
  },
};

