namespace PunaBoost.Models
{
    public class JobSkill
    {
        public Guid JobId { get; set; }
        public Job Job { get; set; }

        public int SkillId { get; set; }
        public Skill Skill { get; set; }
    }
}
