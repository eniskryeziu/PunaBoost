using PunaBoost.Interfaces;

namespace PunaBoost.Services
{
    public class FileService : IFileService
    {
        private readonly IWebHostEnvironment _env;
        private readonly string _resumePath;
        private readonly string _companyLogoPath;
        public FileService(IWebHostEnvironment env)
        {
            _env = env;
            _resumePath = Path.Combine(_env.ContentRootPath, "Documents", "Resumes");
            Directory.CreateDirectory(_resumePath);
            _companyLogoPath = Path.Combine(_env.ContentRootPath, "Documents", "CompaniesLogo");
            Directory.CreateDirectory(_companyLogoPath);
        }
        public async Task<string> SaveResumeAsync(IFormFile file)
        {
            var allowedMimeTypes = new[] { "application/pdf" };
            var allowedExtensions = new[] { ".pdf" };

            if (!allowedMimeTypes.Contains(file.ContentType))
            {
                throw new Exception("Only PDF files are allowed for resumes.");
            }

            var extension = Path.GetExtension(file.FileName).ToLower();
            if (!allowedExtensions.Contains(extension))
            {
                throw new Exception("Only PDF files are allowed for resumes.");
            }

            return await SaveFileAsync(file, _resumePath, allowedMimeTypes);
        }
        public async Task<string> SaveCompanyLogoAsync(IFormFile file)
        {
            return await SaveFileAsync(file, _companyLogoPath);
        }

        public Task DeleteResumeAsync(string filename)
        {
            return DeleteFileAsync(filename, _resumePath);
        }

        public Task DeleteCompanyLogoAsync(string filename)
        {
            return DeleteFileAsync(filename, _companyLogoPath);
        }

        private async Task<string> SaveFileAsync(IFormFile file, string folderPath, string[]? allowedMimeTypes = null)
        {
            var maxFileSize = 10 * 1024 * 1024;

            var defaultAllowedMimeTypes = new[]
            {
                "application/pdf",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                "image/png",
                "image/jpeg",
                "image/jpg",
                "image/webp"
            };

            var mimeTypes = allowedMimeTypes ?? defaultAllowedMimeTypes;

            if (file.Length > maxFileSize || !mimeTypes.Contains(file.ContentType))
                throw new Exception("Invalid file");

            var extension = Path.GetExtension(file.FileName);
            var fileName = Guid.NewGuid() + extension;
            var filePath = Path.Combine(folderPath, fileName);

            using var stream = new FileStream(filePath, FileMode.Create);
            await file.CopyToAsync(stream);

            return fileName;
        }

        private Task DeleteFileAsync(string filename, string folderPath)
        {
            var path = Path.Combine(folderPath, filename);
            if (File.Exists(path)) File.Delete(path);
            return Task.CompletedTask;
        }

        public string GetResumePath(string url)
        {
            return Path.Combine(_env.ContentRootPath, "Documents", "Resumes", url);
        }
        public string GetCompanyLogoPath(string url)
        {
            return Path.Combine(_env.ContentRootPath, "Documents", "CompaniesLogo", url);
        }

    }
}
