using PunaBoost.Dtos;
using Microsoft.AspNetCore.Http;

namespace PunaBoost.Interfaces
{
    public interface IResume
    {
        Task<IEnumerable<ResumeDto>> GetMyResumesAsync(string email);
        Task<ResumeDto> GetByIdAsync(int id, string email);
        Task<ResumeDto> CreateAsync(IFormFile file, ResumeCreateDto dto, string email);
        Task<bool> DeleteAsync(int id, string email);
        Task<ResumeDto> SetDefaultAsync(int id, string email);
    }
}

