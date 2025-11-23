using PunaBoost.Dtos;
using PunaBoost.Models;

namespace PunaBoost.Interfaces
{
    public interface ICompany
    {
        Task<IEnumerable<CompanyDto>> GetAllAsync();
        Task<CompanyDto> GetByIdAsync(Guid id);
        Task<CompanyDto> GetMyCompanyAsync(string email);
        Task<CompanyDto> UpdateAsync(Guid id, CompanyUpdateDto dto, string email);
        Task<IEnumerable<JobDto>> GetJobsByCompanyAsync(Guid companyId);
    }
}
