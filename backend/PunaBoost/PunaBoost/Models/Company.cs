namespace PunaBoost.Models
{
    public class Company
    {

        public Guid Id { get; set; }
        public string CompanyName { get; set; } = string.Empty;
        public string Description { get; set; }
        public string LogoUrl { get; set; }
        public string Website { get; set; }
        public string Location { get; set; }
        public int FoundedYear { get; set; }
        public int NumberOfEmployees { get; set; }
        public string UserId { get; set; }
        public ApplicationUser User { get; set; }
        public string LinkedIn { get; set; } = string.Empty;
        public int? CountryId { get; set; }
        public Country Country { get; set; }
        public int? CityId { get; set; }
        public City City { get; set; }
        public ICollection<Job> Jobs { get; set; } = new List<Job>();
    }
}
