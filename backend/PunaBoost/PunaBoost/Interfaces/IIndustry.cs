using PunaBoost.Models;

namespace PunaBoost.Interfaces
{
    public interface IIndustry
    {
        Task<IEnumerable<Industry>> GetAllAsync();
        Task<Industry> CreateAsync(string industryName);
        Task<Industry> GetByIdAsync(int id);
        Task<Industry> UpdateAsync(int id, string industryName);
        Task DeleteAsync(int id);
    }
}

