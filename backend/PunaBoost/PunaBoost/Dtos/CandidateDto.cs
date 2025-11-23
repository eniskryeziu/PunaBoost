namespace PunaBoost.Dtos
{
    public class CandidateDto
    {
        public Guid Id { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public string PhoneNumber { get; set; }
        public string ResumeUrl { get; set; }
        public ICollection<SkillDto> Skills { get; set; } = new List<SkillDto>();
    }
}
