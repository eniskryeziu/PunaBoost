namespace PunaBoost.Dtos
{
    public class JobApplicationCreateDto
    {
        public Guid JobId { get; set; }
        public int? ResumeId { get; set; } 
        public string Notes { get; set; } = string.Empty;
    }
}

