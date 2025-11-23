import api from '@/lib/api';
import type { CompanyDto, CompanyUpdateDto, JobDto } from '@/types';

export const companyService = {
  async getAll(): Promise<CompanyDto[]> {
    const { data } = await api.get<CompanyDto[]>('/company');
    return data;
  },

  async getById(id: string): Promise<CompanyDto> {
    const { data } = await api.get<CompanyDto>(`/company/${id}`);
    return data;
  },

  async update(id: string, dto: CompanyUpdateDto): Promise<CompanyDto> {
    const { data } = await api.put<CompanyDto>(`/company/${id}`, dto);
    return data;
  },

  async getJobsByCompany(id: string): Promise<JobDto[]> {
    const { data } = await api.get<JobDto[]>(`/company/${id}/jobs`);
    return data;
  },

  async getMyCompany(): Promise<CompanyDto | null> {
    try {
      const { data } = await api.get<CompanyDto>('/company/my-company');
      return data;
    } catch (error) {
      return null;
    }
  },
};

