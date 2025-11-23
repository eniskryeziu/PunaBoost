using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using PunaBoost.Data;
using PunaBoost.Dtos;
using PunaBoost.Interfaces;
using PunaBoost.Models;
using Microsoft.AspNetCore.Http;

namespace PunaBoost.Repository
{
    public class ICandidateRepository : ICandidate
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IFileService _fileService;

        public ICandidateRepository(AppDbContext context, IMapper mapper, UserManager<ApplicationUser> userManager, IFileService fileService)
        {
            _context = context;
            _mapper = mapper;
            _userManager = userManager;
            _fileService = fileService;
        }
        public async Task<IEnumerable<CandidateDto>> GetAllAsync()
        {
            var data = await _context.Candidates
                .Include(c => c.Skills)
                    .ThenInclude(cs => cs.Skill)
                .Include(c => c.User)
                .ProjectTo<CandidateDto>(_mapper.ConfigurationProvider)
                .ToListAsync();
            return data;
        }

        public async Task<CandidateDto> GetByIdAsync(Guid id)
        {
            var data = await _context.Candidates
                .Include(c => c.Skills)
                    .ThenInclude(cs => cs.Skill)
                .Include(c => c.User)
                .Where(c => c.Id == id)
                .ProjectTo<CandidateDto>(_mapper.ConfigurationProvider)
                .SingleOrDefaultAsync();
            return data;
        }

        public async Task<CandidateDto> UpdateAsync(CandidateUpdateDto dto, string email)
        {
            var appUser = await _userManager.FindByEmailAsync(email);
            if (appUser == null)
                throw new Exception("User not found");

            var candidate = await _context.Candidates
                .FirstOrDefaultAsync(c => c.UserId == appUser.Id);
            if (candidate == null)
                throw new Exception("Candidate profile not found");

            candidate.FirstName = dto.FirstName;
            candidate.LastName = dto.LastName;
            appUser.PhoneNumber = dto.PhoneNumber;

            await _userManager.UpdateAsync(appUser);
            await _context.SaveChangesAsync();
            return await GetByIdAsync(candidate.Id);
        }

        public async Task<string> UpdateResumeAsync(IFormFile file, string email)
        {
            var appUser = await _userManager.FindByEmailAsync(email);
            if (appUser == null)
                throw new Exception("User not found");

            var candidate = await _context.Candidates
                .FirstOrDefaultAsync(c => c.UserId == appUser.Id);
            if (candidate == null)
                throw new Exception("Candidate profile not found");

            if (!string.IsNullOrEmpty(candidate.ResumeUrl))
            {
                await _fileService.DeleteResumeAsync(candidate.ResumeUrl);
            }

            var newResumeUrl = await _fileService.SaveResumeAsync(file);
            candidate.ResumeUrl = newResumeUrl;
            await _context.SaveChangesAsync();

            return newResumeUrl;
        }
    }
}
