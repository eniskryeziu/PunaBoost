using PunaBoost.Dtos;
using PunaBoost.Models;

namespace PunaBoost.Interfaces
{
    public interface IJob
    {
        Task<IEnumerable<JobDto>> GetAllAsync();
        Task<JobDto> GetByIdAsync(Guid id);
        Task<Boolean> CreateAsync(JobCreateDto dto, string email);
        Task<Boolean> UpdateAsync(Guid id, JobUpdateDto dto, string email);
        Task<Boolean> DeleteAsync(Guid id, string email);
        Task<IEnumerable<JobDto>> GetJobsByCompanyAsync(string email);
    }
}
