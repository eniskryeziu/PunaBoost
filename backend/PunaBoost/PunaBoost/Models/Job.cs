using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Builder;

namespace PunaBoost.Models
{
    public class Job
    {
        public Guid Id { get; set; }
        [Required]
        public string Title { get; set; }
        [Required]
        public string Description { get; set; } = string.Empty;
        [Required]
        public string Location { get; set; } = string.Empty;
        [Required]
        public decimal SalaryFrom { get; set; }
        public decimal? SalaryTo { get; set; }
        public bool IsRemote { get; set; }
        public Guid CompanyId { get; set; }
        public Company Company { get; set; }
        [Required]
        public int IndustryId { get; set; }
        public Industry Industry { get; set; }
        [Required]
        public int CountryId { get; set; }
        public Country Country { get; set; }
        [Required]
        public int CityId { get; set; }
        public City City { get; set; }
        public ICollection<JobSkill> Skills { get; set; } = new List<JobSkill>();
        public ICollection<JobApplication> Applications { get; set; } = new List<JobApplication>();
        public DateTime PostedAt { get; set; } = DateTime.UtcNow;
        [Required]
        public DateTime ExpiresAt { get; set; }
    }
}
