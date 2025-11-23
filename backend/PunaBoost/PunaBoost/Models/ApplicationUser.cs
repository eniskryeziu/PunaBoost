using Microsoft.AspNetCore.Identity;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory.Database;

namespace PunaBoost.Models
{
    public class ApplicationUser : IdentityUser
    {
        public virtual Company? CompanyProfile { get; set; }
        public virtual Candidate? CandidateProfile { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
