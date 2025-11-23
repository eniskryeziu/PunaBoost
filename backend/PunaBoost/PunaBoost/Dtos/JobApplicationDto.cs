using PunaBoost.Enumes;

namespace PunaBoost.Dtos
{
    public class JobApplicationDto
    {
        public int Id { get; set; }
        public ApplicationStatus Status { get; set; }
        public Guid CandidateId { get; set; }
        public string CandidateFirstName { get; set; } = string.Empty;
        public string CandidateLastName { get; set; } = string.Empty;
        public string CandidateName { get; set; } = string.Empty;
        public string CandidateEmail { get; set; } = string.Empty;
        public string CandidatePhoneNumber { get; set; } = string.Empty;
        public string CandidateResumeUrl { get; set; } = string.Empty;
        public int? ResumeId { get; set; }
        public string ResumeName { get; set; } = string.Empty;
        public string ResumeUrl { get; set; } = string.Empty;
        public Guid JobId { get; set; }
        public string JobTitle { get; set; } = string.Empty;
        public DateTime AppliedAt { get; set; }
        public string Notes { get; set; } = string.Empty;
        
        public string? JobDescription { get; set; }
        public string? JobLocation { get; set; }
        public decimal? SalaryFrom { get; set; }
        public decimal? SalaryTo { get; set; }
        public bool? IsRemote { get; set; }
        public Guid? CompanyId { get; set; }
        public string? CompanyName { get; set; }
        public string? CompanyLogoUrl { get; set; }
        public int? IndustryId { get; set; }
        public string? IndustryName { get; set; }
        public int? CountryId { get; set; }
        public string? CountryName { get; set; }
        public int? CityId { get; set; }
        public string? CityName { get; set; }
        public string? CompanyCountryName { get; set; }
        public string? CompanyCityName { get; set; }
        public DateTime? JobPostedAt { get; set; }
        public DateTime? JobExpiresAt { get; set; }
    }
}

