namespace PunaBoost.Dtos
{
    public class ResumeDto
    {
        public int Id { get; set; }
        public string FileName { get; set; } = string.Empty;
        public string FileUrl { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public Guid CandidateId { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool IsDefault { get; set; }
    }
}

