using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using PunaBoost.Dtos;
using PunaBoost.Extensions;
using PunaBoost.Interfaces;

namespace PunaBoost.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Candidate")]
    public class ResumeController : ControllerBase
    {
        private readonly IResume _repo;

        public ResumeController(IResume repo)
        {
            _repo = repo;
        }

        [HttpGet("my-resumes")]
        public async Task<IActionResult> GetMyResumes()
        {
            try
            {
                var email = User.GetUserEmail();
                var resumes = await _repo.GetMyResumesAsync(email);
                return Ok(resumes);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var email = User.GetUserEmail();
                var resume = await _repo.GetByIdAsync(id, email);
                return Ok(resume);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromForm] IFormFile file, [FromForm] string name, [FromForm] bool isDefault = false)
        {
            try
            {
                if (file == null || file.Length == 0)
                    return BadRequest("File is required");

                var email = User.GetUserEmail();
                var dto = new ResumeCreateDto
                {
                    Name = name ?? file.FileName,
                    IsDefault = isDefault
                };

                var resume = await _repo.CreateAsync(file, dto, email);
                return Ok(resume);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var email = User.GetUserEmail();
                await _repo.DeleteAsync(id, email);
                return Ok(new { message = "Resume deleted successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("{id}/set-default")]
        public async Task<IActionResult> SetDefault(int id)
        {
            try
            {
                var email = User.GetUserEmail();
                var resume = await _repo.SetDefaultAsync(id, email);
                return Ok(resume);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}

