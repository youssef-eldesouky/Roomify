// Services/Background/HoldExpiryService.cs
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Roomify.Data;
using Roomify.Models;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Roomify.Services.Background
{
    public class HoldExpiryService : BackgroundService
    {
        private readonly IServiceProvider _provider;
        private readonly ILogger<HoldExpiryService> _logger;
        private readonly TimeSpan _checkInterval = TimeSpan.FromMinutes(1);

        public HoldExpiryService(IServiceProvider provider, ILogger<HoldExpiryService> logger)
        {
            _provider = provider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("HoldExpiryService started.");
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    using var scope = _provider.CreateScope();
                    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                    var bookingSvc = scope.ServiceProvider.GetRequiredService<Roomify.Services.Interfaces.IBookingService>();

                    var now = DateTime.UtcNow;

                    var pending = await db.Bookings
                        .Where(b => b.Status == BookingStatus.Pending && b.HoldExpiresAt <= now)
                        .Select(b => b.Id)
                        .ToListAsync(stoppingToken);

                    foreach (var id in pending)
                    {
                        _logger.LogInformation("Expiring booking {Id}", id);
                        await bookingSvc.ExpireBookingAsync(id);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error in hold expiry loop");
                }

                try
                {
                    await Task.Delay(_checkInterval, stoppingToken);
                }
                catch (TaskCanceledException) { /* shutting down */ }
            }
        }
    }
}
