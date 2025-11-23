using System.ComponentModel.DataAnnotations;
using PunaBoost.Models;

namespace PunaBoost.Dtos
{
    public class JobCreateDto
    {
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
        [Required]
        public int IndustryId { get; set; }
        [Required]
        public int CountryId { get; set; }
        [Required]
        public int CityId { get; set; }
        [Required]
        public DateTime ExpiresAt { get; set; }
        public List<int> SkillIds { get; set; } = new List<int>();
        public DateTime PostedAt { get; set; } = DateTime.UtcNow;
    }
}
