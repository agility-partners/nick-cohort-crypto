using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Xunit;

namespace CryptoApi.Tests;

public class MarketEndpointTests : IClassFixture<CoinSightApiFactory>
{
    private readonly HttpClient _client;
    private readonly JsonSerializerOptions _jsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    public MarketEndpointTests(CoinSightApiFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetMarketSummary_Returns200WithExpectedShape()
    {
        var response = await _client.GetAsync("/api/market/summary");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var summary = await response.Content.ReadFromJsonAsync<JsonElement>(_jsonOptions);
        Assert.True(summary.TryGetProperty("totalMarketCap", out _), "Missing 'totalMarketCap'");
        Assert.True(summary.TryGetProperty("totalVolume24h", out _), "Missing 'totalVolume24h'");
        Assert.True(summary.TryGetProperty("advancers", out _), "Missing 'advancers'");
        Assert.True(summary.TryGetProperty("decliners", out _), "Missing 'decliners'");
        Assert.True(summary.TryGetProperty("unchanged", out _), "Missing 'unchanged'");
        Assert.True(summary.TryGetProperty("bitcoinDominance", out _), "Missing 'bitcoinDominance'");
    }

    [Fact]
    public async Task GetMarketSummary_AdvancersDeclinersUnchanged_SumToTotalCoins()
    {
        var response = await _client.GetAsync("/api/market/summary");
        var summary = await response.Content.ReadFromJsonAsync<JsonElement>(_jsonOptions);

        var advancers = summary.GetProperty("advancers").GetInt32();
        var decliners = summary.GetProperty("decliners").GetInt32();
        var unchanged = summary.GetProperty("unchanged").GetInt32();

        Assert.Equal(24, advancers + decliners + unchanged);
    }

    [Fact]
    public async Task GetMarketSummary_TotalMarketCapIsPositive()
    {
        var response = await _client.GetAsync("/api/market/summary");
        var summary = await response.Content.ReadFromJsonAsync<JsonElement>(_jsonOptions);

        var totalMarketCap = summary.GetProperty("totalMarketCap").GetDecimal();
        Assert.True(totalMarketCap > 0);
    }

    [Fact]
    public async Task GetMarketSummary_BitcoinDominanceIsReasonable()
    {
        var response = await _client.GetAsync("/api/market/summary");
        var summary = await response.Content.ReadFromJsonAsync<JsonElement>(_jsonOptions);

        var bitcoinDominance = summary.GetProperty("bitcoinDominance").GetDecimal();
        Assert.True(bitcoinDominance > 0 && bitcoinDominance < 100);
    }
}
