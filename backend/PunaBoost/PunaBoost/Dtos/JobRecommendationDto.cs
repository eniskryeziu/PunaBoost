namespace PunaBoost.Dtos
{
    public class JobRecommendationDto
    {
        public JobDto Job { get; set; } = null!;
        public int MatchScore { get; set; } 
        public string Reason { get; set; } = string.Empty;
    }

    public class JobRecommendationRequestDto
    {
        public int ResumeId { get; set; }
    }
}

