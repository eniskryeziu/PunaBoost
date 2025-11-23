namespace PunaBoost.Models
{
    public class Resume
    {
        public int Id { get; set; }
        public string FileName { get; set; } = string.Empty;
        public string FileUrl { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public Guid CandidateId { get; set; }
        public Candidate Candidate { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public bool IsDefault { get; set; } = false;
        public ICollection<JobApplication> Applications { get; set; } = new List<JobApplication>();
    }
}

