using System.ComponentModel.DataAnnotations;
using PunaBoost.Models;

namespace PunaBoost.Dtos
{
    public class JobDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public decimal SalaryFrom { get; set; }
        public decimal? SalaryTo { get; set; }
        public bool IsRemote { get; set; }
        public Guid CompanyId { get; set; }
        public string CompanyName { get; set; }
        public string CompanyLogoUrl { get; set; }
        public int? IndustryId { get; set; }
        public string IndustryName { get; set; }
        public int? CountryId { get; set; }
        public string CountryName { get; set; }
        public int? CityId { get; set; }
        public string CityName { get; set; }
        public string CompanyCountryName { get; set; }
        public string CompanyCityName { get; set; }
        public ICollection<JobSkillDto> Skills { get; set; } = new List<JobSkillDto>();
        public ICollection<JobApplicationDto> Applications { get; set; } = new List<JobApplicationDto>();
        public DateTime PostedAt { get; set; } = DateTime.UtcNow;
        public DateTime? ExpiresAt { get; set; }
    }
}
