using PunaBoost.Enumes;

namespace PunaBoost.Models
{
    public class JobApplication
    {
        public int Id { get; set; }
        public ApplicationStatus Status { get; set; } = ApplicationStatus.Pending;
        public Guid CandidateId { get; set; }
        public Candidate Candidate { get; set; }
        public Guid JobId { get; set; }
        public Job Job { get; set; }
        public int? ResumeId { get; set; } 
        public Resume? Resume { get; set; }
        public DateTime AppliedAt { get; set; } = DateTime.UtcNow;
        public string Notes { get; set; } = string.Empty;
    }
}
