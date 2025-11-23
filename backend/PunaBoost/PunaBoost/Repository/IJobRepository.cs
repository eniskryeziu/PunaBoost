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
    public class IJobRepository : IJob
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;
        private readonly UserManager<ApplicationUser> _userManager;
        public IJobRepository(AppDbContext context, IMapper mapper, UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _mapper = mapper;
            _userManager = userManager;
        }
        public async Task<Boolean> CreateAsync(JobCreateDto dto, string email)
        {
            var appUser = await _userManager.FindByEmailAsync(email);
            if (appUser == null)
                throw new Exception("User not found");

            var company = await _context.Companies
                .FirstOrDefaultAsync(c => c.UserId == appUser.Id);

            if (company == null)
                throw new Exception("Company not found for this user");

            var job = _mapper.Map<Job>(dto);
            job.CompanyId = company.Id;

            _context.Jobs.Add(job);
            await _context.SaveChangesAsync();

     
            if (dto.SkillIds != null && dto.SkillIds.Any())
            {
                var jobSkills = dto.SkillIds
                    .Select(skillId => new JobSkill
                    {
                        JobId = job.Id,
                        SkillId = skillId
                    })
                    .ToList();
                
                _context.JobSkills.AddRange(jobSkills);
                await _context.SaveChangesAsync();
            }

            return true;
        }



        public async Task<IEnumerable<JobDto>> GetAllAsync()
        {
            var now = DateTime.UtcNow;
            var data = await _context.Jobs
                .Include(j => j.Company)
                    .ThenInclude(c => c.Country)
                .Include(j => j.Company)
                    .ThenInclude(c => c.City)
                .Include(j => j.Industry)
                .Include(j => j.Country)
                .Include(j => j.City)
                .Include(j => j.Skills)
                    .ThenInclude(js => js.Skill)
                .Where(j => j.ExpiresAt >= now)
                .OrderByDescending(j => j.PostedAt)
                .ProjectTo<JobDto>(_mapper.ConfigurationProvider)
                .ToListAsync();
            return data;
        }

        public async Task<JobDto> GetByIdAsync(Guid id)
        {
            var data = await _context.Jobs
                .Include(j => j.Company)
                    .ThenInclude(c => c.Country)
                .Include(j => j.Company)
                    .ThenInclude(c => c.City)
                .Include(j => j.Industry)
                .Include(j => j.Country)
                .Include(j => j.City)
                .Include(j => j.Skills)
                    .ThenInclude(js => js.Skill)
                .Where(j => j.Id == id)
                .ProjectTo<JobDto>(_mapper.ConfigurationProvider)
                .SingleOrDefaultAsync();
            return data;
        }

        public async Task<Boolean> UpdateAsync(Guid id, JobUpdateDto dto, string email)
        {
            var appUser = await _userManager.FindByEmailAsync(email);
            if (appUser == null)
                throw new Exception("User not found");

            var company = await _context.Companies
                .FirstOrDefaultAsync(c => c.UserId == appUser.Id);
            if (company == null)
                throw new Exception("Company not found for this user");

            var job = await _context.Jobs
                .Include(j => j.Skills)
                .FirstOrDefaultAsync(j => j.Id == id && j.CompanyId == company.Id);
            if (job == null)
                throw new Exception("Job not found or you don't have permission to update it");

            job.Title = dto.Title;
            job.Description = dto.Description;
            job.Location = dto.Location;
            job.SalaryFrom = dto.SalaryFrom;
            job.SalaryTo = dto.SalaryTo; 
            job.IsRemote = dto.IsRemote;
            job.IndustryId = dto.IndustryId;
            job.CountryId = dto.CountryId;
            job.CityId = dto.CityId;
            job.ExpiresAt = dto.ExpiresAt;

         
            _context.JobSkills.RemoveRange(job.Skills);
            job.Skills = dto.SkillIds
                .Select(skillId => new JobSkill
                {
                    JobId = job.Id,
                    SkillId = skillId
                })
                .ToList();

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<Boolean> DeleteAsync(Guid id, string email)
        {
            var appUser = await _userManager.FindByEmailAsync(email);
            if (appUser == null)
                throw new Exception("User not found");

            var company = await _context.Companies
                .FirstOrDefaultAsync(c => c.UserId == appUser.Id);
            if (company == null)
                throw new Exception("Company not found for this user");

            var job = await _context.Jobs
                .FirstOrDefaultAsync(j => j.Id == id && j.CompanyId == company.Id);
            if (job == null)
                throw new Exception("Job not found or you don't have permission to delete it");

            _context.Jobs.Remove(job);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<JobDto>> GetJobsByCompanyAsync(string email)
        {
            var appUser = await _userManager.FindByEmailAsync(email);
            if (appUser == null)
                throw new Exception("User not found");

            var company = await _context.Companies
                .FirstOrDefaultAsync(c => c.UserId == appUser.Id);
            if (company == null)
                throw new Exception("Company not found for this user");

            var jobs = await _context.Jobs
                .Include(j => j.Company)
                    .ThenInclude(c => c.Country)
                .Include(j => j.Company)
                    .ThenInclude(c => c.City)
                .Include(j => j.Industry)
                .Include(j => j.Country)
                .Include(j => j.City)
                .Include(j => j.Skills)
                    .ThenInclude(js => js.Skill)
                .Where(j => j.CompanyId == company.Id)
                .OrderByDescending(j => j.PostedAt) 
                .ToListAsync();


            var applicationsByJobId = new Dictionary<Guid, List<JobApplicationDto>>();
            
            foreach (var job in jobs)
            {

                var jobApplications = await _context.JobApplications
                    .Include(ja => ja.Candidate)
                        .ThenInclude(c => c.User)
                    .Include(ja => ja.Job)
                    .Where(ja => ja.JobId == job.Id)
                    .Select(ja => new JobApplicationDto
                    {
                        Id = ja.Id,
                        Status = ja.Status,
                        CandidateId = ja.CandidateId,
                        CandidateFirstName = ja.Candidate.FirstName,
                        CandidateLastName = ja.Candidate.LastName,
                        CandidateName = $"{ja.Candidate.FirstName} {ja.Candidate.LastName}".Trim(),
                        CandidateEmail = ja.Candidate.User.Email,
                        CandidatePhoneNumber = ja.Candidate.User.PhoneNumber ?? string.Empty,
                        CandidateResumeUrl = ja.Candidate.ResumeUrl ?? string.Empty,
                        JobId = ja.JobId,
                        JobTitle = ja.Job.Title,
                        AppliedAt = ja.AppliedAt,
                        Notes = ja.Notes
                    })
                    .ToListAsync();
                
                applicationsByJobId[job.Id] = jobApplications;
            }

      
            var data = jobs.Select(job => 
            {
 
                var applicationsDto = applicationsByJobId.ContainsKey(job.Id) 
                    ? applicationsByJobId[job.Id] 
                    : new List<JobApplicationDto>();
                
                return new JobDto
                {
                    Id = job.Id,
                    Title = job.Title,
                    Description = job.Description,
                    Location = job.Location,
                    SalaryFrom = job.SalaryFrom,
                    SalaryTo = job.SalaryTo,
                    IsRemote = job.IsRemote,
                    CompanyId = job.CompanyId,
                    CompanyName = job.Company?.CompanyName,
                    CompanyLogoUrl = job.Company?.LogoUrl,
                    IndustryId = job.IndustryId,
                    IndustryName = job.Industry?.Name,
                    CountryId = job.CountryId,
                    CountryName = job.Country?.Name,
                    CityId = job.CityId,
                    CityName = job.City?.Name,
                    CompanyCountryName = job.Company?.Country?.Name,
                    CompanyCityName = job.Company?.City?.Name,
                    Skills = job.Skills?.Select(js => new JobSkillDto
                    {
                        SkillId = js.SkillId,
                        SkillName = js.Skill?.Name ?? string.Empty
                    }).ToList() ?? new List<JobSkillDto>(),
                    Applications = applicationsDto,
                    PostedAt = job.PostedAt,
                    ExpiresAt = job.ExpiresAt
                };
            }).ToList();

            return data;
        }
    }
}
