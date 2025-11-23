namespace PunaBoost.Dtos
{
    public class CompanyDto
    {
        public Guid Id { get; set; }
        public string CompanyName { get; set; }
        public string Description { get; set; }
        public string LogoUrl { get; set; }
        public string Website { get; set; }
        public string Location { get; set; }
        public int FoundedYear { get; set; }
        public int NumberOfEmployees { get; set; }
        public int? IndustryId { get; set; }
        public string IndustryName { get; set; }
        public string LinkedIn { get; set; }
        public int? CountryId { get; set; }
        public string CountryName { get; set; }
        public int? CityId { get; set; }
        public string CityName { get; set; }
    }
}
