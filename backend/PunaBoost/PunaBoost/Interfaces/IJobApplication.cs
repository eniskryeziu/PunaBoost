using PunaBoost.Dtos;

namespace PunaBoost.Interfaces
{
    public interface IJobApplication
    {
        Task<JobApplicationDto> ApplyAsync(JobApplicationCreateDto dto, string candidateEmail);
        Task<IEnumerable<JobApplicationDto>> GetApplicationsByCandidateAsync(string candidateEmail);
        Task<IEnumerable<JobApplicationDto>> GetApplicationsByJobAsync(Guid jobId, string companyEmail);
        Task<IEnumerable<JobApplicationDto>> GetAllApplicationsByCompanyAsync(string companyEmail);
        Task<JobApplicationDto> UpdateApplicationStatusAsync(int applicationId, JobApplicationUpdateDto dto, string companyEmail);
        Task<JobApplicationDto> GetApplicationByIdAsync(int applicationId);
    }
}

