using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PunaBoost.Data;
using PunaBoost.Dtos;
using PunaBoost.Extensions;
using PunaBoost.Interfaces;
using PunaBoost.Models;

namespace PunaBoost.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CandidateController : ControllerBase
    {
        private readonly ICandidate _repo;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly AppDbContext _context;
        public CandidateController(ICandidate candidate,AppDbContext context, UserManager<ApplicationUser> userManager)
        {
            _repo = candidate;
            _userManager = userManager;
            _context = context;
        }

        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAll()
        {
            var canidates = await _repo.GetAllAsync();
            return Ok(canidates);
        }

        [HttpGet("my-profile")]
        [Authorize(Roles = "Candidate")]
        public async Task<IActionResult> GetMyProfile()
        {
            try
            {
                var email = User.GetUserEmail();
                var appUser = await _userManager.FindByEmailAsync(email);
                if (appUser == null)
                    return Unauthorized("User not found.");

                var candidate = await _context.Candidates
                    .Include(c => c.User)
                    .FirstOrDefaultAsync(c => c.UserId == appUser.Id);

                if (candidate == null)
                    return NotFound("Candidate profile not found.");

                var candidateDto = await _repo.GetByIdAsync(candidate.Id);
                if (candidateDto == null)
                    return NotFound("Candidate profile not found.");

                return Ok(candidateDto);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet]
        [Route("{id:guid}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var canidate = await _repo.GetByIdAsync(id);
            if (canidate == null) return NotFound();
            return Ok(canidate);
        }

        [HttpPost("skills")]
        [Authorize(Roles = "Candidate")]
        public async Task<IActionResult> UpdateSkills([FromBody] CandidateSkillsDto dto)
        {
            var email = User.GetUserEmail();
            var appUser = await _userManager.FindByEmailAsync(email);
            var candidate = await _context.Candidates
                .Include(c => c.Skills)
                .FirstOrDefaultAsync(c => c.UserId == appUser.Id);

            if (candidate == null)
                return Unauthorized("Candidate profile not found.");

            foreach (var cs in candidate.Skills.Where(cs => !dto.SkillIds.Contains(cs.SkillId)).ToList())
            {
                candidate.Skills.Remove(cs);
            }

            var validSkills = await _context.Skills.Where(s => dto.SkillIds.Contains(s.Id)).ToListAsync();

            foreach (var skill in validSkills)
            {
                if (!candidate.Skills.Any(cs => cs.SkillId == skill.Id))
                {
                    candidate.Skills.Add(new CandidateSkill
                    {
                        CandidateId = candidate.Id,
                        SkillId = skill.Id
                    });
                }
            }

            await _context.SaveChangesAsync();
            return Ok();
        }

        [HttpGet("skills/{candidateId:guid}")]
        [Authorize]
        public async Task<IActionResult> GetSkillsById(Guid candidateId)
        {
            var candidate = await _context.Candidates
                .Include(c => c.Skills)
                .ThenInclude(cs => cs.Skill)
                .FirstOrDefaultAsync(c => c.Id == candidateId);

            if (candidate == null)
                return NotFound("Candidate profile not found.");

            var skills = candidate.Skills.Select(cs => new
            {
                cs.Skill.Id,
                cs.Skill.Name
            });

            return Ok(skills);
        }

        [HttpPut("profile")]
        [Authorize(Roles = "Candidate")]
        public async Task<IActionResult> UpdateProfile([FromBody] CandidateUpdateDto dto)
        {
            try
            {
                var email = User.GetUserEmail();
                var candidate = await _repo.UpdateAsync(dto, email);
                return Ok(candidate);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("resume")]
        [Authorize(Roles = "Candidate")]
        public async Task<IActionResult> UpdateResume(IFormFile file)
        {
            try
            {
                var email = User.GetUserEmail();
                var resumeUrl = await _repo.UpdateResumeAsync(file, email);
                return Ok(new { resumeUrl, message = "Resume updated successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
