using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using PunaBoost.Data;
using PunaBoost.Dtos;
using PunaBoost.Interfaces;
using PunaBoost.Models;

namespace PunaBoost.Repository
{
    public class ICompanyRepository : ICompany
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;
        private readonly UserManager<ApplicationUser> _userManager;

        public ICompanyRepository(AppDbContext context, IMapper mapper, UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _mapper = mapper;
            _userManager = userManager;
        }

        public async Task<IEnumerable<CompanyDto>> GetAllAsync()
        {
            var data = await _context.Companies
                .Include(c => c.Country)
                .Include(c => c.City)
                .ProjectTo<CompanyDto>(_mapper.ConfigurationProvider)
                .ToListAsync();
            return data;
        }

        public async Task<CompanyDto> GetByIdAsync(Guid id)
        {
            var data = await _context.Companies
                .Include(c => c.Country)
                .Include(c => c.City)
                .Where(c => c.Id == id)
                .ProjectTo<CompanyDto>(_mapper.ConfigurationProvider)
                .SingleOrDefaultAsync();

            return data;
        }

        public async Task<CompanyDto> GetMyCompanyAsync(string email)
        {
            var appUser = await _userManager.FindByEmailAsync(email);
            if (appUser == null)
                throw new Exception("User not found");

            var data = await _context.Companies
                .Include(c => c.Country)
                .Include(c => c.City)
                .Where(c => c.UserId == appUser.Id)
                .ProjectTo<CompanyDto>(_mapper.ConfigurationProvider)
                .FirstOrDefaultAsync();

            if (data == null)
                throw new Exception("Company profile not found");

            return data;
        }

        public async Task<CompanyDto> UpdateAsync(Guid id, CompanyUpdateDto dto, string email)
        {
            var appUser = await _userManager.FindByEmailAsync(email);
            if (appUser == null)
                throw new Exception("User not found");

            var company = await _context.Companies
                .FirstOrDefaultAsync(c => c.Id == id && c.UserId == appUser.Id);
            if (company == null)
                throw new Exception("Company not found or you don't have permission to update it");

            company.CompanyName = dto.CompanyName;
            company.Description = dto.Description;
            company.Website = dto.Website;
            company.Location = dto.Location;
            company.FoundedYear = dto.FoundedYear;
            company.NumberOfEmployees = dto.NumberOfEmployees;
            company.LinkedIn = dto.LinkedIn;
            company.CountryId = dto.CountryId;
            company.CityId = dto.CityId;

            await _context.SaveChangesAsync();
            return await GetByIdAsync(id);
        }

        public async Task<IEnumerable<JobDto>> GetJobsByCompanyAsync(Guid companyId)
        {
            var now = DateTime.UtcNow.Date;
            var data = await _context.Jobs
                .Include(j => j.Company)
                .Include(j => j.Industry)
                .Include(j => j.Skills)
                    .ThenInclude(js => js.Skill)
                .Where(j => j.CompanyId == companyId && j.ExpiresAt.Date >= now) 
                .OrderByDescending(j => j.PostedAt)
                .ProjectTo<JobDto>(_mapper.ConfigurationProvider)
                .ToListAsync();
            return data;
        }
    }
}
