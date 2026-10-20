using Microsoft.AspNetCore.Hosting;
using Roomify.Services.Interfaces;

namespace Roomify.Services.Implementations
{
    public class LocalFileStorageService : IFileStorageService
    {
        private readonly IWebHostEnvironment _env;
        private readonly ILogger<LocalFileStorageService> _logger;
        private readonly string _rootFolder = "uploads";

        public LocalFileStorageService(IWebHostEnvironment env, ILogger<LocalFileStorageService> logger)
        {
            _env = env;
            _logger = logger;
        }

        public async Task<string> SaveFileAsync(IFormFile file, string? folder = null)
        {
            var safeFolder = Path.Combine(_env.WebRootPath ?? "wwwroot", _rootFolder, folder ?? string.Empty);
            if (!Directory.Exists(safeFolder)) Directory.CreateDirectory(safeFolder);

            var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
            var filePath = Path.Combine(safeFolder, fileName);

            await using var stream = new FileStream(filePath, FileMode.Create);
            await file.CopyToAsync(stream);

            // return relative url
            var url = $"/{_rootFolder}/{(folder != null ? folder + "/" : "")}{fileName}";
            return url;
        }

        public Task DeleteFileAsync(string url)
        {
            try
            {
                var relative = url.TrimStart('/');
                var path = Path.Combine(_env.WebRootPath ?? "wwwroot", relative);
                if (File.Exists(path)) File.Delete(path);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to delete file {Url}", url);
            }
            return Task.CompletedTask;
        }
    }
}
