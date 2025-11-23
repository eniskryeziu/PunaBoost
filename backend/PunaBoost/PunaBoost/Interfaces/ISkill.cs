using PunaBoost.Models;

namespace PunaBoost.Interfaces
{
    public interface ISkill
    {
        Task<IEnumerable<Skill>> GetAllAsync();
        Task<Skill> CreateAsync(string skillName);
        Task<Skill> GetByIdAsync(int id);
        Task<Skill> UpdateAsync(int id, string skillName);
        Task DeleteAsync(int id);
    }
}

