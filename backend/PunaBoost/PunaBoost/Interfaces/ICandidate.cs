using PunaBoost.Dtos;

namespace PunaBoost.Interfaces
{
    public interface ICandidate
    {
        Task<IEnumerable<CandidateDto>> GetAllAsync();
        Task<CandidateDto> GetByIdAsync(Guid id);
        Task<CandidateDto> UpdateAsync(CandidateUpdateDto dto, string email);
        Task<string> UpdateResumeAsync(IFormFile file, string email);
    }
}
