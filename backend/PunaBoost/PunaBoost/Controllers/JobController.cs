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
    public class JobController : ControllerBase
    {
        private readonly IJob _repo;

        public JobController(IJob job)
        {
            _repo = job;
        }

        [HttpPost]
        [Authorize(Roles = "Company")]
        public async Task<IActionResult> Create([FromBody] JobCreateDto dto)
        {
            try
            {
                var email = User.GetUserEmail();
                await _repo.CreateAsync(dto, email);
                return Created();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var jobs = await _repo.GetAllAsync();
            return Ok(jobs);
        }

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var job = await _repo.GetByIdAsync(id);
            if (job == null) return NotFound();
            return Ok(job);
        }

        [HttpPut("{id:guid}")]
        [Authorize(Roles = "Company")]
        public async Task<IActionResult> Update(Guid id, [FromBody] JobUpdateDto dto)
        {
            try
            {
                var email = User.GetUserEmail();
                await _repo.UpdateAsync(id, dto, email);
                return Ok(new { message = "Job updated successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete("{id:guid}")]
        [Authorize(Roles = "Company")]
        public async Task<IActionResult> Delete(Guid id)
        {
            try
            {
                var email = User.GetUserEmail();
                await _repo.DeleteAsync(id, email);
                return Ok(new { message = "Job deleted successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("my-jobs")]
        [Authorize(Roles = "Company")]
        public async Task<IActionResult> GetMyJobs()
        {
            try
            {
                var email = User.GetUserEmail();
                var jobs = await _repo.GetJobsByCompanyAsync(email);
                return Ok(jobs);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
