using PunaBoost.Dtos;

namespace PunaBoost.Interfaces
{
    public interface ICountry
    {
        Task<IEnumerable<CountryDto>> GetAllAsync();
        Task<CountryDto> GetByIdAsync(int id);
        Task<CountryDto> CreateAsync(CountryCreateDto dto);
        Task<CountryDto> UpdateAsync(int id, CountryCreateDto dto);
        Task<bool> DeleteAsync(int id);
    }
}

