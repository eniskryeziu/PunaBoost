namespace PunaBoost.Dtos
{
    public class JobSkillDto
    {
        public Guid JobId { get; set; }
        public int SkillId { get; set; }
        public string SkillName { get; set; } = string.Empty;
    }
}
