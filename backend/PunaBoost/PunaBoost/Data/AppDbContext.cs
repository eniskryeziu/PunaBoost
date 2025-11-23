using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using PunaBoost.Models;

namespace PunaBoost.Data
{
    public class AppDbContext : IdentityDbContext<ApplicationUser>
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Company> Companies { get; set; }
        public DbSet<Candidate> Candidates { get; set; }
        public DbSet<Job> Jobs { get; set; }
        public DbSet<JobApplication> JobApplications { get; set; }
        public DbSet<Industry> Industries { get; set; }
        public DbSet<Skill> Skills { get; set; }
        public DbSet<JobSkill> JobSkills { get; set; }
        public DbSet<CandidateSkill> CandidateSkills { get; set; }
        public DbSet<Country> Countries { get; set; }
        public DbSet<City> Cities { get; set; }
        public DbSet<Resume> Resumes { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            // ApplicationUser - Company
            builder.Entity<ApplicationUser>()
                .HasOne(u => u.CompanyProfile)
                .WithOne(c => c.User)
                .HasForeignKey<Company>(c => c.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            // ApplicationUser - Candidate
            builder.Entity<ApplicationUser>()
                .HasOne(u => u.CandidateProfile)
                .WithOne(c => c.User)
                .HasForeignKey<Candidate>(c => c.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            // Company - Jobs
            builder.Entity<Company>()
                .HasMany(c => c.Jobs)
                .WithOne(j => j.Company)
                .HasForeignKey(j => j.CompanyId)
                .OnDelete(DeleteBehavior.Cascade);

            // Company - Country
            builder.Entity<Company>()
                .HasOne(c => c.Country)
                .WithMany()
                .HasForeignKey(c => c.CountryId)
                .OnDelete(DeleteBehavior.NoAction);

            // Company - City
            builder.Entity<Company>()
                .HasOne(c => c.City)
                .WithMany()
                .HasForeignKey(c => c.CityId)
                .OnDelete(DeleteBehavior.NoAction);

            // Job - Industry
            builder.Entity<Job>()
                .HasOne(j => j.Industry)
                .WithMany(i => i.Jobs)
                .HasForeignKey(j => j.IndustryId)
                .OnDelete(DeleteBehavior.SetNull);

            // Job - Country
            builder.Entity<Job>()
                .HasOne(j => j.Country)
                .WithMany()
                .HasForeignKey(j => j.CountryId)
                .OnDelete(DeleteBehavior.NoAction);

            // Job - City
            builder.Entity<Job>()
                .HasOne(j => j.City)
                .WithMany()
                .HasForeignKey(j => j.CityId)
                .OnDelete(DeleteBehavior.NoAction);

            // Job - JobApplication
            builder.Entity<Job>()
                .HasMany(j => j.Applications)
                .WithOne(a => a.Job)
                .HasForeignKey(a => a.JobId)
                .OnDelete(DeleteBehavior.Cascade);

            // Candidate - JobApplication
            builder.Entity<JobApplication>()
                .HasOne(a => a.Candidate)
                .WithMany(c => c.Applications)
                .HasForeignKey(a => a.CandidateId)
                .OnDelete(DeleteBehavior.Cascade);

            // Candidate - Resumes
            builder.Entity<Resume>()
                .HasOne(r => r.Candidate)
                .WithMany(c => c.Resumes)
                .HasForeignKey(r => r.CandidateId)
                .OnDelete(DeleteBehavior.Cascade);

            // JobApplication - Resume
            builder.Entity<JobApplication>()
                .HasOne(a => a.Resume)
                .WithMany(r => r.Applications)
                .HasForeignKey(a => a.ResumeId)
                .OnDelete(DeleteBehavior.SetNull);

            // CandidateSkill
            builder.Entity<CandidateSkill>()
                .HasKey(cs => new { cs.CandidateId, cs.SkillId });

            builder.Entity<CandidateSkill>()
                .HasOne(cs => cs.Candidate)
                .WithMany(c => c.Skills)
                .HasForeignKey(cs => cs.CandidateId);

            builder.Entity<CandidateSkill>()
                .HasOne(cs => cs.Skill)
                .WithMany(s => s.CandidateSkills)
                .HasForeignKey(cs => cs.SkillId);

            // JobSkill
            builder.Entity<JobSkill>()
                .HasKey(js => new { js.JobId, js.SkillId });

            builder.Entity<JobSkill>()
                .HasOne(js => js.Job)
                .WithMany(j => j.Skills)
                .HasForeignKey(js => js.JobId);

            builder.Entity<JobSkill>()
                .HasOne(js => js.Skill)
                .WithMany(s => s.JobSkills)
                .HasForeignKey(js => js.SkillId);

            // Indexes
            builder.Entity<Job>().HasIndex(j => j.Title);
            builder.Entity<Job>().HasIndex(j => j.Location);
            builder.Entity<Job>().HasIndex(j => j.IsRemote);
            builder.Entity<Industry>().HasIndex(i => i.Name).IsUnique();
            builder.Entity<Skill>().HasIndex(s => s.Name).IsUnique();

            // Country - Cities
            builder.Entity<Country>()
                .HasMany(c => c.Cities)
                .WithOne(c => c.Country)
                .HasForeignKey(c => c.CountryId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<Country>().HasIndex(c => c.Code).IsUnique();
            builder.Entity<City>().HasIndex(c => new { c.Name, c.CountryId }).IsUnique();

            builder.Entity<Job>().Property(j => j.SalaryFrom).HasPrecision(18, 2);
            builder.Entity<Job>().Property(j => j.SalaryTo).HasPrecision(18, 2);


            builder.Entity<Industry>().HasData(
                new Industry { Id = 1, Name = "Administratë" },
                new Industry { Id = 2, Name = "Teknologji e Informacionit" },
                new Industry { Id = 3, Name = "Burime Njerëzore" },
                new Industry { Id = 4, Name = "Ekonomi, Financë, Kontabilitet" },
                new Industry { Id = 5, Name = "Banka" }
            );
        }
    }
}
