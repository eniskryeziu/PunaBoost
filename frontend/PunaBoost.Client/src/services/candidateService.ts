import api from '@/lib/api';
import type { CandidateDto, CandidateUpdateDto, CandidateSkillsDto, Skill } from '@/types';

export const candidateService = {
  async getAll(): Promise<CandidateDto[]> {
    const { data } = await api.get<CandidateDto[]>('/candidate');
    return data;
  },

  async getMyProfile(): Promise<CandidateDto> {
    const { data } = await api.get<CandidateDto>('/candidate/my-profile');
    return data;
  },

  async getById(id: string): Promise<CandidateDto> {
    const { data } = await api.get<CandidateDto>(`/candidate/${id}`);
    return data;
  },

  async updateProfile(dto: CandidateUpdateDto): Promise<CandidateDto> {
    const { data } = await api.put<CandidateDto>('/candidate/profile', dto);
    return data;
  },

  async updateSkills(dto: CandidateSkillsDto): Promise<void> {
    await api.post('/candidate/skills', dto);
  },

  async getSkills(candidateId: string): Promise<Skill[]> {
    const { data } = await api.get<Skill[]>(`/candidate/skills/${candidateId}`);
    return data;
  },

  async updateResume(file: File): Promise<{ resumeUrl: string; message: string }> {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await api.put('/candidate/resume', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },
};

