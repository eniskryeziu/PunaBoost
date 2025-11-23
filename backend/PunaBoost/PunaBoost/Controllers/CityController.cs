using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PunaBoost.Dtos;
using PunaBoost.Interfaces;

namespace PunaBoost.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CityController : ControllerBase
    {
        private readonly ICity _repo;

        public CityController(ICity repo)
        {
            _repo = repo;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var cities = await _repo.GetAllAsync();
            return Ok(cities);
        }

        [HttpGet("country/{countryId:int}")]
        public async Task<IActionResult> GetByCountryId(int countryId)
        {
            try
            {
                var cities = await _repo.GetByCountryIdAsync(countryId);
                return Ok(cities);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var city = await _repo.GetByIdAsync(id);
                return Ok(city);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create([FromBody] CityCreateDto dto)
        {
            try
            {
                var city = await _repo.CreateAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id = city.Id }, city);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("{id:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(int id, [FromBody] CityCreateDto dto)
        {
            try
            {
                var city = await _repo.UpdateAsync(id, dto);
                return Ok(city);
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
                return Ok(new { message = "City deleted successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}

