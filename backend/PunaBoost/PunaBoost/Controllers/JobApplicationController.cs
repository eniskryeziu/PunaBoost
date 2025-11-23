using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PunaBoost.Dtos;
using PunaBoost.Extensions;
using PunaBoost.Interfaces;

namespace PunaBoost.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class JobApplicationController : ControllerBase
    {
        private readonly IJobApplication _repo;

        public JobApplicationController(IJobApplication repo)
        {
            _repo = repo;
        }

        [HttpPost("apply")]
        [Authorize(Roles = "Candidate")]
        public async Task<IActionResult> Apply([FromBody] JobApplicationCreateDto dto)
        {
            try
            {
                var email = User.GetUserEmail();
                var application = await _repo.ApplyAsync(dto, email);
                return CreatedAtAction(nameof(GetById), new { id = application.Id }, application);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("my-applications")]
        [Authorize(Roles = "Candidate")]
        public async Task<IActionResult> GetMyApplications()
        {
            try
            {
                var email = User.GetUserEmail();
                var applications = await _repo.GetApplicationsByCandidateAsync(email);
                return Ok(applications);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("job/{jobId:guid}")]
        [Authorize(Roles = "Company")]
        public async Task<IActionResult> GetApplicationsByJob(Guid jobId)
        {
            try
            {
                var email = User.GetUserEmail();
                var applications = await _repo.GetApplicationsByJobAsync(jobId, email);
                return Ok(applications);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("company/all")]
        [Authorize(Roles = "Company")]
        public async Task<IActionResult> GetAllApplicationsByCompany()
        {
            try
            {
                var email = User.GetUserEmail();
                var applications = await _repo.GetAllApplicationsByCompanyAsync(email);
                return Ok(applications);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("{id:int}/status")]
        [Authorize(Roles = "Company")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] JobApplicationUpdateDto dto)
        {
            try
            {
                var email = User.GetUserEmail();
                var application = await _repo.UpdateApplicationStatusAsync(id, dto, email);
                return Ok(application);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("{id:int}")]
        [Authorize]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var application = await _repo.GetApplicationByIdAsync(id);
                return Ok(application);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}

