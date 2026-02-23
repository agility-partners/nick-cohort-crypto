using CryptoApi.Services;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace CryptoApi.Tests;

/// <summary>
/// Custom WebApplicationFactory that registers CoinService as Singleton
/// so watchlist state persists across HTTP requests within a single test.
/// Production uses Scoped (one instance per request), which means the
/// in-memory watchlist resets on every request. For integration tests
/// that need multi-step flows (add → verify, add → duplicate check,
/// add → delete), we need the same instance to survive across calls.
/// </summary>
public class CoinSightApiFactory : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureServices(services =>
        {
            // Remove the existing Scoped registration
            var descriptor = services.SingleOrDefault(
                d => d.ServiceType == typeof(ICoinService));

            if (descriptor != null)
            {
                services.Remove(descriptor);
            }

            // Re-register as Singleton so state persists across requests
            services.AddSingleton<ICoinService, CoinService>();
        });

        // Suppress noisy log output during test runs
        builder.ConfigureLogging(logging =>
        {
            logging.SetMinimumLevel(LogLevel.Error);
        });
    }
}
