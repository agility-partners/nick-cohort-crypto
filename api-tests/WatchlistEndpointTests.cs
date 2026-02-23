using System.Net;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using Xunit;

namespace CryptoApi.Tests;

/// <summary>
/// Uses CoinSightApiFactory (Singleton CoinService) so watchlist state
/// persists across HTTP requests within each test. Each test creates
/// its own factory + client so tests don't leak state between each other.
/// </summary>
public class WatchlistEndpointTests
{
    private readonly JsonSerializerOptions _jsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    private static HttpClient CreateClient()
    {
        var factory = new CoinSightApiFactory();
        return factory.CreateClient();
    }

    [Fact]
    public async Task GetWatchlist_Empty_Returns200WithEmptyArray()
    {
        var client = CreateClient();

        var response = await client.GetAsync("/api/watchlist");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var watchlist = await response.Content.ReadFromJsonAsync<JsonElement[]>(_jsonOptions);
        Assert.NotNull(watchlist);
        Assert.Empty(watchlist);
    }

    [Fact]
    public async Task AddToWatchlist_ValidCoin_Returns201()
    {
        var client = CreateClient();
        var content = JsonContent.Create(new { coinId = "bitcoin" });

        var response = await client.PostAsync("/api/watchlist", content);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        var coin = await response.Content.ReadFromJsonAsync<JsonElement>(_jsonOptions);
        Assert.Equal("bitcoin", coin.GetProperty("id").GetString());
        Assert.Equal("Bitcoin", coin.GetProperty("name").GetString());
    }

    [Fact]
    public async Task AddToWatchlist_ValidCoin_ReturnsLocationHeader()
    {
        var client = CreateClient();
        var content = JsonContent.Create(new { coinId = "ethereum" });

        var response = await client.PostAsync("/api/watchlist", content);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        Assert.NotNull(response.Headers.Location);
        Assert.Contains("/api/coins/ethereum", response.Headers.Location.ToString());
    }

    [Fact]
    public async Task AddToWatchlist_InvalidCoin_Returns404()
    {
        var client = CreateClient();
        var content = JsonContent.Create(new { coinId = "fakecoin" });

        var response = await client.PostAsync("/api/watchlist", content);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task AddToWatchlist_EmptyBody_Returns400()
    {
        var client = CreateClient();
        var content = new StringContent("{}", Encoding.UTF8, "application/json");

        var response = await client.PostAsync("/api/watchlist", content);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task AddToWatchlist_Duplicate_Returns409()
    {
        var client = CreateClient();

        // First add — should succeed
        var first = await client.PostAsync("/api/watchlist", JsonContent.Create(new { coinId = "bitcoin" }));
        Assert.Equal(HttpStatusCode.Created, first.StatusCode);

        // Second add — same coin, should conflict
        var second = await client.PostAsync("/api/watchlist", JsonContent.Create(new { coinId = "bitcoin" }));
        Assert.Equal(HttpStatusCode.Conflict, second.StatusCode);
    }

    [Fact]
    public async Task RemoveFromWatchlist_AfterAdd_Returns204()
    {
        var client = CreateClient();

        // Add first
        var addResponse = await client.PostAsync("/api/watchlist", JsonContent.Create(new { coinId = "bitcoin" }));
        Assert.Equal(HttpStatusCode.Created, addResponse.StatusCode);

        // Then remove
        var response = await client.DeleteAsync("/api/watchlist/bitcoin");
        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    }

    [Fact]
    public async Task RemoveFromWatchlist_NotInWatchlist_Returns404()
    {
        var client = CreateClient();

        var response = await client.DeleteAsync("/api/watchlist/bitcoin");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }
}
