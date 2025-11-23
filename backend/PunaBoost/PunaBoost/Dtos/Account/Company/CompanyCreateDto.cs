using PunaBoost.Models;

namespace PunaBoost.Dtos.Account.Company
{
    public class CompanyCreateDto
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string CompanyName { get; set; } = string.Empty;
        public string PhoneNumber {  get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Website { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public int FoundedYear { get; set; }
        public int NumberOfEmployees { get; set; }
        public int? CountryId { get; set; }
        public int? CityId { get; set; }
    }
}
