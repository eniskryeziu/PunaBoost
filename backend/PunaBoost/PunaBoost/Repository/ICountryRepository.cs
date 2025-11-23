using Microsoft.EntityFrameworkCore;
using PunaBoost.Data;
using PunaBoost.Dtos;
using PunaBoost.Interfaces;
using PunaBoost.Models;

namespace PunaBoost.Repository
{
    public class ICountryRepository : ICountry
    {
        private readonly AppDbContext _context;

        public ICountryRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<CountryDto>> GetAllAsync()
        {
            return await _context.Countries
                .OrderBy(c => c.Name)
                .Select(c => new CountryDto
                {
                    Id = c.Id,
                    Name = c.Name,
                    Code = c.Code
                })
                .ToListAsync();
        }

        public async Task<CountryDto> GetByIdAsync(int id)
        {
            var country = await _context.Countries.FindAsync(id);
            if (country == null)
                throw new Exception("Country not found");

            return new CountryDto
            {
                Id = country.Id,
                Name = country.Name,
                Code = country.Code
            };
        }

        public async Task<CountryDto> CreateAsync(CountryCreateDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Name))
                throw new Exception("Country name cannot be empty");

            if (string.IsNullOrWhiteSpace(dto.Code))
                throw new Exception("Country code cannot be empty");

            var existingCountry = await _context.Countries
                .FirstOrDefaultAsync(c => c.Code.ToLower() == dto.Code.ToLower() || c.Name.ToLower() == dto.Name.ToLower());
            if (existingCountry != null)
                throw new Exception("Country already exists");

            var country = new Country
            {
                Name = dto.Name.Trim(),
                Code = dto.Code.Trim().ToUpper()
            };

            _context.Countries.Add(country);
            await _context.SaveChangesAsync();

            return new CountryDto
            {
                Id = country.Id,
                Name = country.Name,
                Code = country.Code
            };
        }

        public async Task<CountryDto> UpdateAsync(int id, CountryCreateDto dto)
        {
            var country = await _context.Countries.FindAsync(id);
            if (country == null)
                throw new Exception("Country not found");

            if (string.IsNullOrWhiteSpace(dto.Name))
                throw new Exception("Country name cannot be empty");

            if (string.IsNullOrWhiteSpace(dto.Code))
                throw new Exception("Country code cannot be empty");

            var existingCountry = await _context.Countries
                .FirstOrDefaultAsync(c => (c.Code.ToLower() == dto.Code.ToLower() || c.Name.ToLower() == dto.Name.ToLower()) && c.Id != id);
            if (existingCountry != null)
                throw new Exception("Country with this name or code already exists");

            country.Name = dto.Name.Trim();
            country.Code = dto.Code.Trim().ToUpper();

            await _context.SaveChangesAsync();

            return new CountryDto
            {
                Id = country.Id,
                Name = country.Name,
                Code = country.Code
            };
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var country = await _context.Countries
                .Include(c => c.Cities)
                .FirstOrDefaultAsync(c => c.Id == id);
            if (country == null)
                throw new Exception("Country not found");

            if (country.Cities.Any())
                throw new Exception("Cannot delete country with existing cities");

            _context.Countries.Remove(country);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}

