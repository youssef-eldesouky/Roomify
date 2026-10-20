using Microsoft.AspNetCore.Mvc;
using Roomify.DTOs.Search;
using Roomify.Services.Interfaces;

namespace Roomify.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SearchController : ControllerBase
    {
        private readonly IListingService _listingService;
        public SearchController(IListingService listingService)
        {
            _listingService = listingService;
        }

        [HttpGet]
        public async Task<IActionResult> Search([FromQuery] SearchRequest req)
        {
            // ListingService will handle date-based availability
            var results = await _listingService.SearchAsync(req);
            return Ok(results);
        }
    }
}
