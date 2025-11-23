import api from '@/lib/api';
import type { JobApplicationDto, JobApplicationCreateDto, JobApplicationUpdateDto } from '@/types';

export const jobApplicationService = {
  async apply(dto: JobApplicationCreateDto): Promise<JobApplicationDto> {
    const { data } = await api.post<JobApplicationDto>('/jobapplication/apply', dto);
    return data;
  },

  async getMyApplications(): Promise<JobApplicationDto[]> {
    const { data } = await api.get<JobApplicationDto[]>('/jobapplication/my-applications');
    return data;
  },

  async getApplicationsByJob(jobId: string): Promise<JobApplicationDto[]> {
    const { data } = await api.get<JobApplicationDto[]>(`/jobapplication/job/${jobId}`);
    return data;
  },

  async getAllCompanyApplications(): Promise<JobApplicationDto[]> {
    const { data } = await api.get<JobApplicationDto[]>('/jobapplication/company/all');
    return data;
  },

  async updateStatus(id: number, dto: JobApplicationUpdateDto): Promise<JobApplicationDto> {
    const { data } = await api.put<JobApplicationDto>(`/jobapplication/${id}/status`, dto);
    return data;
  },

  async getById(id: number): Promise<JobApplicationDto> {
    const { data } = await api.get<JobApplicationDto>(`/jobapplication/${id}`);
    return data;
  },
};

