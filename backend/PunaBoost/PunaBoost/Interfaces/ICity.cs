using PunaBoost.Dtos;

namespace PunaBoost.Interfaces
{
    public interface ICity
    {
        Task<IEnumerable<CityDto>> GetAllAsync();
        Task<IEnumerable<CityDto>> GetByCountryIdAsync(int countryId);
        Task<CityDto> GetByIdAsync(int id);
        Task<CityDto> CreateAsync(CityCreateDto dto);
        Task<CityDto> UpdateAsync(int id, CityCreateDto dto);
        Task<bool> DeleteAsync(int id);
    }
}

