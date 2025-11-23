import api from '@/lib/api';
import type { JobDto } from '@/types';

export interface JobRecommendation {
  job: JobDto;
  matchScore: number;
  reason: string;
}

export interface JobRecommendationRequest {
  resumeId: number;
}

export const jobRecommendationService = {
  async getRecommendations(resumeId: number): Promise<JobRecommendation[]> {
    const { data } = await api.post<JobRecommendation[]>('/jobrecommendation/recommend', {
      resumeId
    });
    return data;
  }
};

