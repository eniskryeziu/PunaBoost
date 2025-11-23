import api from '@/lib/api';
import type { JobDto, JobCreateDto, JobUpdateDto } from '@/types';

export const jobService = {
  async getAll(): Promise<JobDto[]> {
    const { data } = await api.get<JobDto[]>('/job');
    return data;
  },

  async getById(id: string): Promise<JobDto> {
    const { data } = await api.get<JobDto>(`/job/${id}`);
    return data;
  },

  async create(dto: JobCreateDto): Promise<void> {
    const payload: any = { ...dto };
    if (payload.salaryTo === undefined || payload.salaryTo === null || payload.salaryTo === 0) {
      delete payload.salaryTo;
    }
    await api.post('/job', payload);
  },

  async update(id: string, dto: JobUpdateDto): Promise<{ message: string }> {
    const payload: any = { ...dto };
    if (payload.salaryTo === undefined || payload.salaryTo === null || payload.salaryTo === 0) {
      delete payload.salaryTo;
    }
    const { data } = await api.put<{ message: string }>(`/job/${id}`, payload);
    return data;
  },

  async delete(id: string): Promise<{ message: string }> {
    const { data } = await api.delete<{ message: string }>(`/job/${id}`);
    return data;
  },

  async getMyJobs(): Promise<JobDto[]> {
    const { data } = await api.get<JobDto[]>('/job/my-jobs');
    return data;
  },
};

