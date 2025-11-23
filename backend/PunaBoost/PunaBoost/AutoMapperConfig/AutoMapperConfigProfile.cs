using AutoMapper;
using PunaBoost.Dtos;
using PunaBoost.Models;

namespace PunaBoost.AutoMapperConfig
{
    public class AutoMapperConfigProfile : Profile
    {

        public AutoMapperConfigProfile()
        {
            CreateMap<Company, CompanyDto>()
                .ForMember(dest => dest.CountryName, opt => opt.MapFrom(src => src.Country != null ? src.Country.Name : null))
                .ForMember(dest => dest.CityName, opt => opt.MapFrom(src => src.City != null ? src.City.Name : null));
            CreateMap<Candidate, CandidateDto>()
                .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.User.Email))
                .ForMember(dest => dest.PhoneNumber, opt => opt.MapFrom(src => src.User.PhoneNumber))
                .ForMember(dest => dest.Skills, opt => opt.MapFrom(src => src.Skills.Select(cs => new SkillDto
                {
                    Id = cs.Skill != null ? cs.Skill.Id : 0,
                    Name = cs.Skill != null ? cs.Skill.Name : string.Empty
                })));

            CreateMap<Job, JobDto>()
                .ForMember(dest => dest.CompanyName, opt => opt.MapFrom(src => src.Company != null ? src.Company.CompanyName : null))
                .ForMember(dest => dest.CompanyLogoUrl, opt => opt.MapFrom(src => src.Company != null ? src.Company.LogoUrl : null))
                .ForMember(dest => dest.IndustryName, opt => opt.MapFrom(src => src.Industry != null ? src.Industry.Name : null))
                .ForMember(dest => dest.CountryName, opt => opt.MapFrom(src => src.Country != null ? src.Country.Name : null))
                .ForMember(dest => dest.CityName, opt => opt.MapFrom(src => src.City != null ? src.City.Name : null))
                .ForMember(dest => dest.CompanyCountryName, opt => opt.MapFrom(src => src.Company != null && src.Company.Country != null ? src.Company.Country.Name : null))
                .ForMember(dest => dest.CompanyCityName, opt => opt.MapFrom(src => src.Company != null && src.Company.City != null ? src.Company.City.Name : null))
                .ForMember(dest => dest.Skills, opt => opt.MapFrom(src => src.Skills.Select(js => new JobSkillDto
                {
                    SkillId = js.SkillId,
                    SkillName = js.Skill != null ? js.Skill.Name : string.Empty
                })))
                .ForMember(dest => dest.Applications, opt => opt.MapFrom(src => src.Applications.Select(app => new JobApplicationDto
                {
                    Id = app.Id,
                    Status = app.Status,
                    CandidateId = app.CandidateId,
                    CandidateFirstName = app.Candidate != null ? app.Candidate.FirstName : string.Empty,
                    CandidateLastName = app.Candidate != null ? app.Candidate.LastName : string.Empty,
                    CandidateName = app.Candidate != null ? $"{app.Candidate.FirstName} {app.Candidate.LastName}".Trim() : string.Empty,
                    CandidateEmail = app.Candidate != null && app.Candidate.User != null ? app.Candidate.User.Email : string.Empty,
                    JobId = app.JobId,
                    JobTitle = app.Job != null ? app.Job.Title : string.Empty,
                    AppliedAt = app.AppliedAt,
                    Notes = app.Notes
                })));
            CreateMap<JobDto, Job>();
            CreateMap<JobCreateDto, Job>();
            CreateMap<JobSkill, JobSkillDto>()
                .ForMember(dest => dest.SkillName, opt => opt.MapFrom(src => src.Skill != null ? src.Skill.Name : string.Empty));
            
            CreateMap<Resume, ResumeDto>();
        }
    }
}
