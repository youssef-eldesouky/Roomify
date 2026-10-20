namespace Roomify.Services.Interfaces
{
    public interface IFileStorageService
    {
        Task<string> SaveFileAsync(IFormFile file, string? folder = null);
        Task DeleteFileAsync(string url);
    }
}
