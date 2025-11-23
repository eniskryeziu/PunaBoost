using Microsoft.EntityFrameworkCore;
using PunaBoost.Data;
using PunaBoost.Dtos;
using PunaBoost.Interfaces;
using PunaBoost.Models;

namespace PunaBoost.Repository
{
    public class ICityRepository : ICity
    {
        private readonly AppDbContext _context;

        public ICityRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<CityDto>> GetAllAsync()
        {
            return await _context.Cities
                .Include(c => c.Country)
                .OrderBy(c => c.Country.Name)
                .ThenBy(c => c.Name)
                .Select(c => new CityDto
                {
                    Id = c.Id,
                    Name = c.Name,
                    CountryId = c.CountryId,
                    CountryName = c.Country.Name
                })
                .ToListAsync();
        }

        public async Task<IEnumerable<CityDto>> GetByCountryIdAsync(int countryId)
        {
            return await _context.Cities
                .Include(c => c.Country)
                .Where(c => c.CountryId == countryId)
                .OrderBy(c => c.Name)
                .Select(c => new CityDto
                {
                    Id = c.Id,
                    Name = c.Name,
                    CountryId = c.CountryId,
                    CountryName = c.Country.Name
                })
                .ToListAsync();
        }

        public async Task<CityDto> GetByIdAsync(int id)
        {
            var city = await _context.Cities
                .Include(c => c.Country)
                .FirstOrDefaultAsync(c => c.Id == id);
            if (city == null)
                throw new Exception("City not found");

            return new CityDto
            {
                Id = city.Id,
                Name = city.Name,
                CountryId = city.CountryId,
                CountryName = city.Country.Name
            };
        }

        public async Task<CityDto> CreateAsync(CityCreateDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Name))
                throw new Exception("City name cannot be empty");

            var country = await _context.Countries.FindAsync(dto.CountryId);
            if (country == null)
                throw new Exception("Country not found");

            var existingCity = await _context.Cities
                .FirstOrDefaultAsync(c => c.Name.ToLower() == dto.Name.ToLower() && c.CountryId == dto.CountryId);
            if (existingCity != null)
                throw new Exception("City already exists in this country");

            var city = new City
            {
                Name = dto.Name.Trim(),
                CountryId = dto.CountryId
            };

            _context.Cities.Add(city);
            await _context.SaveChangesAsync();

            return new CityDto
            {
                Id = city.Id,
                Name = city.Name,
                CountryId = city.CountryId,
                CountryName = country.Name
            };
        }

        public async Task<CityDto> UpdateAsync(int id, CityCreateDto dto)
        {
            var city = await _context.Cities.FindAsync(id);
            if (city == null)
                throw new Exception("City not found");

            if (string.IsNullOrWhiteSpace(dto.Name))
                throw new Exception("City name cannot be empty");

            var country = await _context.Countries.FindAsync(dto.CountryId);
            if (country == null)
                throw new Exception("Country not found");

            var existingCity = await _context.Cities
                .FirstOrDefaultAsync(c => c.Name.ToLower() == dto.Name.ToLower() && c.CountryId == dto.CountryId && c.Id != id);
            if (existingCity != null)
                throw new Exception("City already exists in this country");

            city.Name = dto.Name.Trim();
            city.CountryId = dto.CountryId;

            await _context.SaveChangesAsync();

            return new CityDto
            {
                Id = city.Id,
                Name = city.Name,
                CountryId = city.CountryId,
                CountryName = country.Name
            };
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var city = await _context.Cities.FindAsync(id);
            if (city == null)
                throw new Exception("City not found");

            _context.Cities.Remove(city);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}

