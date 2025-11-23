namespace PunaBoost.Models
{
    public class CandidateSkill
    {
        public Guid CandidateId { get; set; }
        public Candidate Candidate { get; set; }

        public int SkillId { get; set; }
        public Skill Skill { get; set; }
    }
}
