using Microsoft.EntityFrameworkCore;
using PunaBoost.Data;
using PunaBoost.Interfaces;
using PunaBoost.Models;

namespace PunaBoost.Repository
{
    public class ISkillRepository : ISkill
    {
        private readonly AppDbContext _context;

        public ISkillRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Skill>> GetAllAsync()
        {
            return await _context.Skills.OrderBy(s => s.Name).ToListAsync();
        }

        public async Task<Skill> CreateAsync(string skillName)
        {
            if (string.IsNullOrWhiteSpace(skillName))
                throw new Exception("Skill name cannot be empty");

            var existingSkill = await _context.Skills
                .FirstOrDefaultAsync(s => s.Name.ToLower() == skillName.ToLower());
            if (existingSkill != null)
                throw new Exception("Skill already exists");

            var skill = new Skill
            {
                Name = skillName.Trim()
            };

            _context.Skills.Add(skill);
            await _context.SaveChangesAsync();
            return skill;
        }

        public async Task<Skill> GetByIdAsync(int id)
        {
            var skill = await _context.Skills.FindAsync(id);
            if (skill == null)
                throw new Exception("Skill not found");
            return skill;
        }

        public async Task<Skill> UpdateAsync(int id, string skillName)
        {
            if (string.IsNullOrWhiteSpace(skillName))
                throw new Exception("Skill name cannot be empty");

            var skill = await _context.Skills.FindAsync(id);
            if (skill == null)
                throw new Exception("Skill not found");

            var existingSkill = await _context.Skills
                .FirstOrDefaultAsync(s => s.Name.ToLower() == skillName.ToLower() && s.Id != id);
            if (existingSkill != null)
                throw new Exception("Skill with this name already exists");

            skill.Name = skillName.Trim();
            await _context.SaveChangesAsync();
            return skill;
        }

        public async Task DeleteAsync(int id)
        {
            var skill = await _context.Skills.FindAsync(id);
            if (skill == null)
                throw new Exception("Skill not found");

            _context.Skills.Remove(skill);
            await _context.SaveChangesAsync();
        }
    }
}

