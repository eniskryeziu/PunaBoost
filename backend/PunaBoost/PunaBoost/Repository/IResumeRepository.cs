using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http;
using PunaBoost.Data;
using PunaBoost.Dtos;
using PunaBoost.Interfaces;
using PunaBoost.Models;

namespace PunaBoost.Repository
{
    public class IResumeRepository : IResume
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IFileService _fileService;

        public IResumeRepository(AppDbContext context, IMapper mapper, UserManager<ApplicationUser> userManager, IFileService fileService)
        {
            _context = context;
            _mapper = mapper;
            _userManager = userManager;
            _fileService = fileService;
        }

        public async Task<IEnumerable<ResumeDto>> GetMyResumesAsync(string email)
        {
            var appUser = await _userManager.FindByEmailAsync(email);
            if (appUser == null)
                throw new Exception("User not found");

            var candidate = await _context.Candidates
                .FirstOrDefaultAsync(c => c.UserId == appUser.Id);
            if (candidate == null)
                throw new Exception("Candidate profile not found");

            var resumes = await _context.Resumes
                .Where(r => r.CandidateId == candidate.Id)
                .OrderByDescending(r => r.IsDefault)
                .ThenByDescending(r => r.CreatedAt)
                .ProjectTo<ResumeDto>(_mapper.ConfigurationProvider)
                .ToListAsync();

            return resumes;
        }

        public async Task<ResumeDto> GetByIdAsync(int id, string email)
        {
            var appUser = await _userManager.FindByEmailAsync(email);
            if (appUser == null)
                throw new Exception("User not found");

            var candidate = await _context.Candidates
                .FirstOrDefaultAsync(c => c.UserId == appUser.Id);
            if (candidate == null)
                throw new Exception("Candidate profile not found");

            var resume = await _context.Resumes
                .Where(r => r.Id == id && r.CandidateId == candidate.Id)
                .ProjectTo<ResumeDto>(_mapper.ConfigurationProvider)
                .FirstOrDefaultAsync();

            if (resume == null)
                throw new Exception("Resume not found");

            return resume;
        }

        public async Task<ResumeDto> CreateAsync(IFormFile file, ResumeCreateDto dto, string email)
        {
            var appUser = await _userManager.FindByEmailAsync(email);
            if (appUser == null)
                throw new Exception("User not found");

            var candidate = await _context.Candidates
                .FirstOrDefaultAsync(c => c.UserId == appUser.Id);
            if (candidate == null)
                throw new Exception("Candidate profile not found");

        
            if (dto.IsDefault)
            {
                var existingDefaults = await _context.Resumes
                    .Where(r => r.CandidateId == candidate.Id && r.IsDefault)
                    .ToListAsync();
                foreach (var existing in existingDefaults)
                {
                    existing.IsDefault = false;
                }
            }

            var fileUrl = await _fileService.SaveResumeAsync(file);
            var fileName = file.FileName;

            var resume = new Resume
            {
                FileName = fileName,
                FileUrl = fileUrl,
                Name = dto.Name,
                CandidateId = candidate.Id,
                IsDefault = dto.IsDefault,
                CreatedAt = DateTime.UtcNow
            };

            _context.Resumes.Add(resume);
            await _context.SaveChangesAsync();

            return await GetByIdAsync(resume.Id, email);
        }

        public async Task<bool> DeleteAsync(int id, string email)
        {
            var appUser = await _userManager.FindByEmailAsync(email);
            if (appUser == null)
                throw new Exception("User not found");

            var candidate = await _context.Candidates
                .FirstOrDefaultAsync(c => c.UserId == appUser.Id);
            if (candidate == null)
                throw new Exception("Candidate profile not found");

            var resume = await _context.Resumes
                .Include(r => r.Applications)
                .FirstOrDefaultAsync(r => r.Id == id && r.CandidateId == candidate.Id);

            if (resume == null)
                throw new Exception("Resume not found");

            
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
             
                if (resume.Applications != null && resume.Applications.Any())
                {
                    foreach (var application in resume.Applications)
                    {
                        application.ResumeId = null;
                    }
                }

                await _context.SaveChangesAsync();
                await _fileService.DeleteResumeAsync(resume.FileUrl);
                _context.Resumes.Remove(resume);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return true;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<ResumeDto> SetDefaultAsync(int id, string email)
        {
            var appUser = await _userManager.FindByEmailAsync(email);
            if (appUser == null)
                throw new Exception("User not found");

            var candidate = await _context.Candidates
                .FirstOrDefaultAsync(c => c.UserId == appUser.Id);
            if (candidate == null)
                throw new Exception("Candidate profile not found");

            var resume = await _context.Resumes
                .FirstOrDefaultAsync(r => r.Id == id && r.CandidateId == candidate.Id);

            if (resume == null)
                throw new Exception("Resume not found");

 
            var existingDefaults = await _context.Resumes
                .Where(r => r.CandidateId == candidate.Id && r.IsDefault && r.Id != id)
                .ToListAsync();
            foreach (var existing in existingDefaults)
            {
                existing.IsDefault = false;
            }

            resume.IsDefault = true;
            await _context.SaveChangesAsync();

            return await GetByIdAsync(resume.Id, email);
        }
    }
}

