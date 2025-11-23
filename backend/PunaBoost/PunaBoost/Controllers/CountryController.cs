using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PunaBoost.Dtos;
using PunaBoost.Interfaces;

namespace PunaBoost.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CountryController : ControllerBase
    {
        private readonly ICountry _repo;

        public CountryController(ICountry repo)
        {
            _repo = repo;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var countries = await _repo.GetAllAsync();
            return Ok(countries);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var country = await _repo.GetByIdAsync(id);
                return Ok(country);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create([FromBody] CountryCreateDto dto)
        {
            try
            {
                var country = await _repo.CreateAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id = country.Id }, country);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("{id:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(int id, [FromBody] CountryCreateDto dto)
        {
            try
            {
                var country = await _repo.UpdateAsync(id, dto);
                return Ok(country);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete("{id:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                await _repo.DeleteAsync(id);
                return Ok(new { message = "Country deleted successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}

