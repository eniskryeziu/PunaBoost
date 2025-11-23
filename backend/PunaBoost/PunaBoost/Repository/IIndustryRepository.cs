using Microsoft.EntityFrameworkCore;
using PunaBoost.Data;
using PunaBoost.Interfaces;
using PunaBoost.Models;

namespace PunaBoost.Repository
{
    public class IIndustryRepository : IIndustry
    {
        private readonly AppDbContext _context;

        public IIndustryRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Industry>> GetAllAsync()
        {
            return await _context.Industries.OrderBy(i => i.Name).ToListAsync();
        }

        public async Task<Industry> CreateAsync(string industryName)
        {
            if (string.IsNullOrWhiteSpace(industryName))
                throw new Exception("Industry name cannot be empty");

            var existingIndustry = await _context.Industries
                .FirstOrDefaultAsync(i => i.Name.ToLower() == industryName.ToLower());
            if (existingIndustry != null)
                throw new Exception("Industry already exists");

            var industry = new Industry
            {
                Name = industryName.Trim()
            };

            _context.Industries.Add(industry);
            await _context.SaveChangesAsync();
            return industry;
        }

        public async Task<Industry> GetByIdAsync(int id)
        {
            var industry = await _context.Industries.FindAsync(id);
            if (industry == null)
                throw new Exception("Industry not found");
            return industry;
        }

        public async Task<Industry> UpdateAsync(int id, string industryName)
        {
            if (string.IsNullOrWhiteSpace(industryName))
                throw new Exception("Industry name cannot be empty");

            var industry = await _context.Industries.FindAsync(id);
            if (industry == null)
                throw new Exception("Industry not found");

            var existingIndustry = await _context.Industries
                .FirstOrDefaultAsync(i => i.Name.ToLower() == industryName.ToLower() && i.Id != id);
            if (existingIndustry != null)
                throw new Exception("Industry with this name already exists");

            industry.Name = industryName.Trim();
            await _context.SaveChangesAsync();
            return industry;
        }

        public async Task DeleteAsync(int id)
        {
            var industry = await _context.Industries.FindAsync(id);
            if (industry == null)
                throw new Exception("Industry not found");

            _context.Industries.Remove(industry);
            await _context.SaveChangesAsync();
        }
    }
}

