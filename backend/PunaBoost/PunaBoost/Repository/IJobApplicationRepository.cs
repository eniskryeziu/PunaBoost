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
    public class IJobApplicationRepository : IJobApplication
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;
        private readonly UserManager<ApplicationUser> _userManager;

        public IJobApplicationRepository(AppDbContext context, IMapper mapper, UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _mapper = mapper;
            _userManager = userManager;
        }

        public async Task<JobApplicationDto> ApplyAsync(JobApplicationCreateDto dto, string candidateEmail)
        {
            var appUser = await _userManager.FindByEmailAsync(candidateEmail);
            if (appUser == null)
                throw new Exception("User not found");

            var candidate = await _context.Candidates
                .FirstOrDefaultAsync(c => c.UserId == appUser.Id);
            if (candidate == null)
                throw new Exception("Candidate profile not found");

            var existingApplication = await _context.JobApplications
                .FirstOrDefaultAsync(ja => ja.JobId == dto.JobId && ja.CandidateId == candidate.Id);
            if (existingApplication != null)
                throw new Exception("You have already applied for this job");

            var job = await _context.Jobs
                .FirstOrDefaultAsync(j => j.Id == dto.JobId);
            if (job == null)
                throw new Exception("Job not found");

        
            if (dto.ResumeId.HasValue)
            {
                var resume = await _context.Resumes
                    .FirstOrDefaultAsync(r => r.Id == dto.ResumeId.Value && r.CandidateId == candidate.Id);
                if (resume == null)
                    throw new Exception("Resume not found or doesn't belong to you");
            }

            var application = new JobApplication
            {
                CandidateId = candidate.Id,
                JobId = dto.JobId,
                ResumeId = dto.ResumeId,
                Status = Enumes.ApplicationStatus.Pending,
                AppliedAt = DateTime.UtcNow,
                Notes = dto.Notes ?? string.Empty
            };

            _context.JobApplications.Add(application);
            await _context.SaveChangesAsync();

            return await GetApplicationByIdAsync(application.Id);
        }

        public async Task<IEnumerable<JobApplicationDto>> GetApplicationsByCandidateAsync(string candidateEmail)
        {
            var appUser = await _userManager.FindByEmailAsync(candidateEmail);
            if (appUser == null)
                throw new Exception("User not found");

            var candidate = await _context.Candidates
                .FirstOrDefaultAsync(c => c.UserId == appUser.Id);
            if (candidate == null)
                throw new Exception("Candidate profile not found");

            var applications = await _context.JobApplications
                .Include(ja => ja.Candidate)
                    .ThenInclude(c => c.User)
                .Include(ja => ja.Job)
                    .ThenInclude(j => j.Company)
                        .ThenInclude(c => c.Country)
                .Include(ja => ja.Job)
                    .ThenInclude(j => j.Company)
                        .ThenInclude(c => c.City)
                .Include(ja => ja.Job)
                    .ThenInclude(j => j.Industry)
                .Include(ja => ja.Job)
                    .ThenInclude(j => j.Country)
                .Include(ja => ja.Job)
                    .ThenInclude(j => j.City)
                .Include(ja => ja.Resume)
                .Where(ja => ja.CandidateId == candidate.Id)
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
                    ResumeId = ja.ResumeId,
                    ResumeName = ja.Resume != null ? ja.Resume.Name : string.Empty,
                    ResumeUrl = ja.Resume != null ? ja.Resume.FileUrl : string.Empty,
                    JobId = ja.JobId,
                    JobTitle = ja.Job.Title,
                    AppliedAt = ja.AppliedAt,
                    Notes = ja.Notes,
                    JobDescription = ja.Job.Description,
                    JobLocation = ja.Job.Location,
                    SalaryFrom = ja.Job.SalaryFrom,
                    SalaryTo = ja.Job.SalaryTo,
                    IsRemote = ja.Job.IsRemote,
                    CompanyId = ja.Job.CompanyId,
                    CompanyName = ja.Job.Company != null ? ja.Job.Company.CompanyName : null,
                    CompanyLogoUrl = ja.Job.Company != null ? ja.Job.Company.LogoUrl : null,
                    IndustryId = ja.Job.IndustryId,
                    IndustryName = ja.Job.Industry != null ? ja.Job.Industry.Name : null,
                    CountryId = ja.Job.CountryId,
                    CountryName = ja.Job.Country != null ? ja.Job.Country.Name : null,
                    CityId = ja.Job.CityId,
                    CityName = ja.Job.City != null ? ja.Job.City.Name : null,
                    CompanyCountryName = ja.Job.Company != null && ja.Job.Company.Country != null ? ja.Job.Company.Country.Name : null,
                    CompanyCityName = ja.Job.Company != null && ja.Job.Company.City != null ? ja.Job.Company.City.Name : null,
                    JobPostedAt = ja.Job.PostedAt,
                    JobExpiresAt = ja.Job.ExpiresAt
                })
                .ToListAsync();

            return applications;
        }

        public async Task<IEnumerable<JobApplicationDto>> GetApplicationsByJobAsync(Guid jobId, string companyEmail)
        {
            var appUser = await _userManager.FindByEmailAsync(companyEmail);
            if (appUser == null)
                throw new Exception("User not found");

            var company = await _context.Companies
                .FirstOrDefaultAsync(c => c.UserId == appUser.Id);
            if (company == null)
                throw new Exception("Company not found for this user");

            var job = await _context.Jobs
                .FirstOrDefaultAsync(j => j.Id == jobId && j.CompanyId == company.Id);
            if (job == null)
                throw new Exception("Job not found or you don't have permission to view applications");

            var applications = await _context.JobApplications
                .Include(ja => ja.Candidate)
                    .ThenInclude(c => c.User)
                .Include(ja => ja.Job)
                    .ThenInclude(j => j.Company)
                        .ThenInclude(c => c.Country)
                .Include(ja => ja.Job)
                    .ThenInclude(j => j.Company)
                        .ThenInclude(c => c.City)
                .Include(ja => ja.Job)
                    .ThenInclude(j => j.Industry)
                .Include(ja => ja.Job)
                    .ThenInclude(j => j.Country)
                .Include(ja => ja.Job)
                    .ThenInclude(j => j.City)
                .Include(ja => ja.Resume)
                .Where(ja => ja.JobId == jobId)
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
                    ResumeId = ja.ResumeId,
                    ResumeName = ja.Resume != null ? ja.Resume.Name : string.Empty,
                    ResumeUrl = ja.Resume != null ? ja.Resume.FileUrl : string.Empty,
                    JobId = ja.JobId,
                    JobTitle = ja.Job.Title,
                    AppliedAt = ja.AppliedAt,
                    Notes = ja.Notes,
                    JobDescription = ja.Job.Description,
                    JobLocation = ja.Job.Location,
                    SalaryFrom = ja.Job.SalaryFrom,
                    SalaryTo = ja.Job.SalaryTo,
                    IsRemote = ja.Job.IsRemote,
                    CompanyId = ja.Job.CompanyId,
                    CompanyName = ja.Job.Company != null ? ja.Job.Company.CompanyName : null,
                    CompanyLogoUrl = ja.Job.Company != null ? ja.Job.Company.LogoUrl : null,
                    IndustryId = ja.Job.IndustryId,
                    IndustryName = ja.Job.Industry != null ? ja.Job.Industry.Name : null,
                    CountryId = ja.Job.CountryId,
                    CountryName = ja.Job.Country != null ? ja.Job.Country.Name : null,
                    CityId = ja.Job.CityId,
                    CityName = ja.Job.City != null ? ja.Job.City.Name : null,
                    CompanyCountryName = ja.Job.Company != null && ja.Job.Company.Country != null ? ja.Job.Company.Country.Name : null,
                    CompanyCityName = ja.Job.Company != null && ja.Job.Company.City != null ? ja.Job.Company.City.Name : null,
                    JobPostedAt = ja.Job.PostedAt,
                    JobExpiresAt = ja.Job.ExpiresAt
                })
                .OrderByDescending(ja => ja.AppliedAt)
                .ToListAsync();

            return applications;
        }

        public async Task<IEnumerable<JobApplicationDto>> GetAllApplicationsByCompanyAsync(string companyEmail)
        {
            var appUser = await _userManager.FindByEmailAsync(companyEmail);
            if (appUser == null)
                throw new Exception("User not found");

            var company = await _context.Companies
                .FirstOrDefaultAsync(c => c.UserId == appUser.Id);
            if (company == null)
                throw new Exception("Company not found for this user");

            var applications = await _context.JobApplications
                .Include(ja => ja.Candidate)
                    .ThenInclude(c => c.User)
                .Include(ja => ja.Job)
                    .ThenInclude(j => j.Company)
                        .ThenInclude(c => c.Country)
                .Include(ja => ja.Job)
                    .ThenInclude(j => j.Company)
                        .ThenInclude(c => c.City)
                .Include(ja => ja.Job)
                    .ThenInclude(j => j.Industry)
                .Include(ja => ja.Job)
                    .ThenInclude(j => j.Country)
                .Include(ja => ja.Job)
                    .ThenInclude(j => j.City)
                .Include(ja => ja.Resume)
                .Where(ja => ja.Job.CompanyId == company.Id)
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
                    ResumeId = ja.ResumeId,
                    ResumeName = ja.Resume != null ? ja.Resume.Name : string.Empty,
                    ResumeUrl = ja.Resume != null ? ja.Resume.FileUrl : string.Empty,
                    JobId = ja.JobId,
                    JobTitle = ja.Job.Title,
                    AppliedAt = ja.AppliedAt,
                    Notes = ja.Notes,
                    JobDescription = ja.Job.Description,
                    JobLocation = ja.Job.Location,
                    SalaryFrom = ja.Job.SalaryFrom,
                    SalaryTo = ja.Job.SalaryTo,
                    IsRemote = ja.Job.IsRemote,
                    CompanyId = ja.Job.CompanyId,
                    CompanyName = ja.Job.Company != null ? ja.Job.Company.CompanyName : null,
                    CompanyLogoUrl = ja.Job.Company != null ? ja.Job.Company.LogoUrl : null,
                    IndustryId = ja.Job.IndustryId,
                    IndustryName = ja.Job.Industry != null ? ja.Job.Industry.Name : null,
                    CountryId = ja.Job.CountryId,
                    CountryName = ja.Job.Country != null ? ja.Job.Country.Name : null,
                    CityId = ja.Job.CityId,
                    CityName = ja.Job.City != null ? ja.Job.City.Name : null,
                    CompanyCountryName = ja.Job.Company != null && ja.Job.Company.Country != null ? ja.Job.Company.Country.Name : null,
                    CompanyCityName = ja.Job.Company != null && ja.Job.Company.City != null ? ja.Job.Company.City.Name : null,
                    JobPostedAt = ja.Job.PostedAt,
                    JobExpiresAt = ja.Job.ExpiresAt
                })
                .OrderByDescending(ja => ja.AppliedAt)
                .ToListAsync();

            return applications;
        }

        public async Task<JobApplicationDto> UpdateApplicationStatusAsync(int applicationId, JobApplicationUpdateDto dto, string companyEmail)
        {
            var appUser = await _userManager.FindByEmailAsync(companyEmail);
            if (appUser == null)
                throw new Exception("User not found");

            var company = await _context.Companies
                .FirstOrDefaultAsync(c => c.UserId == appUser.Id);
            if (company == null)
                throw new Exception("Company not found for this user");

            var application = await _context.JobApplications
                .Include(ja => ja.Job)
                .FirstOrDefaultAsync(ja => ja.Id == applicationId);
            if (application == null)
                throw new Exception("Application not found");

            if (application.Job.CompanyId != company.Id)
                throw new Exception("You don't have permission to update this application");

            application.Status = dto.Status;
            await _context.SaveChangesAsync();

            return await GetApplicationByIdAsync(applicationId);
        }

        public async Task<JobApplicationDto> GetApplicationByIdAsync(int applicationId)
        {
            var application = await _context.JobApplications
                .Include(ja => ja.Candidate)
                    .ThenInclude(c => c.User)
                .Include(ja => ja.Job)
                .Include(ja => ja.Resume)
                .Where(ja => ja.Id == applicationId)
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
                    ResumeId = ja.ResumeId,
                    ResumeName = ja.Resume != null ? ja.Resume.Name : string.Empty,
                    ResumeUrl = ja.Resume != null ? ja.Resume.FileUrl : string.Empty,
                    JobId = ja.JobId,
                    JobTitle = ja.Job.Title,
                    AppliedAt = ja.AppliedAt,
                    Notes = ja.Notes
                })
                .SingleOrDefaultAsync();

            if (application == null)
                throw new Exception("Application not found");

            return application;
        }
    }
}

