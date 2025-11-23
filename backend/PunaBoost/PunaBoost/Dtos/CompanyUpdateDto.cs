namespace PunaBoost.Dtos
{
    public class CompanyUpdateDto
    {
        public string CompanyName { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Website { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public int FoundedYear { get; set; }
        public int NumberOfEmployees { get; set; }
        public int? IndustryId { get; set; }
        public string LinkedIn { get; set; } = string.Empty;
        public int? CountryId { get; set; }
        public int? CityId { get; set; }
    }
}

