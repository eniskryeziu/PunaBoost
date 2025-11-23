import api from '@/lib/api';
import type { ResumeDto } from '@/types';

export const resumeService = {
  async getMyResumes(): Promise<ResumeDto[]> {
    const { data } = await api.get<ResumeDto[]>('/resume/my-resumes');
    return data;
  },

  async getById(id: number): Promise<ResumeDto> {
    const { data } = await api.get<ResumeDto>(`/resume/${id}`);
    return data;
  },

  async create(file: File, name: string, isDefault: boolean = false): Promise<ResumeDto> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', name);
    formData.append('isDefault', isDefault.toString());
    
    const { data } = await api.post<ResumeDto>('/resume', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/resume/${id}`);
  },

  async setDefault(id: number): Promise<ResumeDto> {
    const { data } = await api.put<ResumeDto>(`/resume/${id}/set-default`);
    return data;
  },
};

