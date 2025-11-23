namespace PunaBoost.Models
{
    public class Industry
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public ICollection<Job> Jobs { get; set; } = new List<Job>();
        public ICollection<Company> Companies { get; set; } = new List<Company>();
    }
}
