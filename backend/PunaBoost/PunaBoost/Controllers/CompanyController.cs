using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using PunaBoost.Dtos;
using PunaBoost.Dtos.Account.Company;
using PunaBoost.Extensions;
using PunaBoost.Interfaces;

namespace PunaBoost.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CompanyController : ControllerBase
    {
        private readonly ICompany _repo;
        public CompanyController(ICompany company)
        {
            _repo = company;
        }
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var companies = await _repo.GetAllAsync();
            return Ok(companies);
        }

        [HttpGet("my-company")]
        [Authorize(Roles = "Company")]
        public async Task<IActionResult> GetMyCompany()
        {
            try
            {
                var email = User.GetUserEmail();
                var company = await _repo.GetMyCompanyAsync(email);
                return Ok(company);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet]
        [Route("{id:guid}")]
        public async Task<IActionResult> GetById([FromRoute] Guid id)
        {
            var company = await _repo.GetByIdAsync(id);
            if (company == null) return NotFound();
            return Ok(company);
        }

        [HttpPut("{id:guid}")]
        [Authorize(Roles = "Company")]
        public async Task<IActionResult> Update(Guid id, [FromBody] CompanyUpdateDto dto)
        {
            try
            {
                var email = User.GetUserEmail();
                var company = await _repo.UpdateAsync(id, dto, email);
                return Ok(company);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("{id:guid}/jobs")]
        public async Task<IActionResult> GetJobsByCompany(Guid id)
        {
            try
            {
                var jobs = await _repo.GetJobsByCompanyAsync(id);
                return Ok(jobs);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
