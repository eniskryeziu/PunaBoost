using Microsoft.AspNetCore.Builder;

namespace PunaBoost.Models
{
    public class Candidate
    {
        public Guid Id { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string? ResumeUrl { get; set; }
        public string UserId { get; set; }
        public ApplicationUser User { get; set; }
        public ICollection<CandidateSkill> Skills { get; set; } = new List<CandidateSkill>();
        public ICollection<JobApplication> Applications { get; set; } = new List<JobApplication>();
        public ICollection<Resume> Resumes { get; set; } = new List<Resume>();
    }
}
