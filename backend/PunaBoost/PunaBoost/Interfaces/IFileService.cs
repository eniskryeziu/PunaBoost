namespace PunaBoost.Interfaces
{
    public interface IFileService
    {
        Task<string> SaveResumeAsync(IFormFile file);
        Task<string> SaveCompanyLogoAsync(IFormFile file);
        Task DeleteResumeAsync(string filename);
        Task DeleteCompanyLogoAsync(string filename);
        string GetResumePath(string url);
        string GetCompanyLogoPath(string url);
    }
}
