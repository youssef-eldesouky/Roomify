using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Roomify.Services.Interfaces;

namespace Roomify.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MediaController : ControllerBase
    {
        private readonly IFileStorageService _storage;
        public MediaController(IFileStorageService storage) => _storage = storage;

        [HttpPost("upload")]
        [Authorize(Roles = "Host,Admin")]
        public async Task<IActionResult> Upload([FromForm] IFormFile file)
        {
            if (file == null || file.Length == 0) return BadRequest(new { message = "file is required" });
            var url = await _storage.SaveFileAsync(file);
            return Ok(new { url });
        }
    }
}
