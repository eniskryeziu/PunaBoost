using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PunaBoost.Data;
using PunaBoost.Dtos;
using PunaBoost.Extensions;
using PunaBoost.Interfaces;
using PunaBoost.Services;

namespace PunaBoost.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class JobRecommendationController : ControllerBase
    {
        private readonly IOpenRouterService _openRouterService;
        private readonly IResumeTextExtractionService _resumeTextExtractionService;
        private readonly IJob _jobRepository;
        private readonly IFileService _fileService;
        private readonly AppDbContext _context;
        private readonly ILogger<JobRecommendationController> _logger;

        public JobRecommendationController(
            IOpenRouterService openRouterService,
            IResumeTextExtractionService resumeTextExtractionService,
            IJob jobRepository,
            IFileService fileService,
            AppDbContext context,
            ILogger<JobRecommendationController> logger)
        {
            _openRouterService = openRouterService;
            _resumeTextExtractionService = resumeTextExtractionService;
            _jobRepository = jobRepository;
            _fileService = fileService;
            _context = context;
            _logger = logger;
        }

        [HttpPost("recommend")]
        public async Task<IActionResult> GetRecommendations([FromBody] JobRecommendationRequestDto request)
        {
            try
            {
                var email = User.GetUserEmail();
                var userRole = User.Claims.FirstOrDefault(c => c.Type == "http://schemas.microsoft.com/ws/2008/06/identity/claims/role")?.Value;

                if (userRole != "Candidate")
                {
                    return Forbid("Only candidates can get job recommendations");
                }

                var resume = await _context.Resumes
                    .Include(r => r.Candidate)
                        .ThenInclude(c => c.User)
                    .FirstOrDefaultAsync(r => r.Id == request.ResumeId && r.Candidate.User.Email == email);

                if (resume == null)
                {
                    return NotFound("Resume not found");
                }

                var filePath = _fileService.GetResumePath(resume.FileUrl);
                string resumeText;
                
                try
                {
                    resumeText = await _resumeTextExtractionService.ExtractTextFromResumeAsync(filePath);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error extracting text from resume");
                    return BadRequest($"Could not extract text from resume: {ex.Message}");
                }

                if (string.IsNullOrWhiteSpace(resumeText))
                {
                    return BadRequest("Could not extract text from resume");
                }

                var allJobs = await _jobRepository.GetAllAsync();
                var activeJobs = allJobs.Where(j => j.ExpiresAt == null || j.ExpiresAt.Value > DateTime.UtcNow).ToList();

                if (!activeJobs.Any())
                {
                    return Ok(new List<JobRecommendationDto>());
                }

                var recommendations = await _openRouterService.GetJobRecommendationsAsync(resumeText, activeJobs);

                return Ok(recommendations);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting job recommendations");
                return StatusCode(500, "An error occurred while getting recommendations");
            }
        }
    }
}

