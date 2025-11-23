import api from '@/lib/api';
import type { Skill } from '@/types';

export const skillService = {
  async getAll(): Promise<Skill[]> {
    const { data } = await api.get<Skill[]>('/skill');
    return data;
  },

  async getById(id: number): Promise<Skill> {
    const { data } = await api.get<Skill>(`/skill/${id}`);
    return data;
  },

  async create(name: string): Promise<Skill> {
    const { data } = await api.post<Skill>('/skill', { name });
    return data;
  },

  async update(id: number, name: string): Promise<Skill> {
    const { data } = await api.put<Skill>(`/skill/${id}`, { name });
    return data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/skill/${id}`);
  },
};

