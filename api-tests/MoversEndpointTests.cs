using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Xunit;

namespace CryptoApi.Tests;

public class MoversEndpointTests : IClassFixture<CoinSightApiFactory>
{
    private readonly HttpClient _client;
    private readonly JsonSerializerOptions _jsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    public MoversEndpointTests(CoinSightApiFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetTopMovers_DefaultLimit_Returns200WithGainersAndLosers()
    {
        var response = await _client.GetAsync("/api/movers");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var movers = await response.Content.ReadFromJsonAsync<JsonElement>(_jsonOptions);
        Assert.True(movers.TryGetProperty("gainers", out var gainers), "Missing 'gainers'");
        Assert.True(movers.TryGetProperty("losers", out var losers), "Missing 'losers'");
        Assert.Equal(5, gainers.GetArrayLength());
        Assert.Equal(5, losers.GetArrayLength());
    }

    [Fact]
    public async Task GetTopMovers_CustomLimit_RespectsLimit()
    {
        var response = await _client.GetAsync("/api/movers?limit=3");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var movers = await response.Content.ReadFromJsonAsync<JsonElement>(_jsonOptions);
        Assert.Equal(3, movers.GetProperty("gainers").GetArrayLength());
        Assert.Equal(3, movers.GetProperty("losers").GetArrayLength());
    }

    [Fact]
    public async Task GetTopMovers_GainersAreSortedDescending()
    {
        var response = await _client.GetAsync("/api/movers?limit=5");
        var movers = await response.Content.ReadFromJsonAsync<JsonElement>(_jsonOptions);
        var gainers = movers.GetProperty("gainers");

        decimal previousChange = decimal.MaxValue;
        foreach (var gainer in gainers.EnumerateArray())
        {
            var change = gainer.GetProperty("change24h").GetDecimal();
            Assert.True(change <= previousChange, "Gainers should be sorted by change24h descending");
            previousChange = change;
        }
    }

    [Fact]
    public async Task GetTopMovers_LosersAreSortedAscending()
    {
        var response = await _client.GetAsync("/api/movers?limit=5");
        var movers = await response.Content.ReadFromJsonAsync<JsonElement>(_jsonOptions);
        var losers = movers.GetProperty("losers");

        decimal previousChange = decimal.MinValue;
        foreach (var loser in losers.EnumerateArray())
        {
            var change = loser.GetProperty("change24h").GetDecimal();
            Assert.True(change >= previousChange, "Losers should be sorted by change24h ascending");
            previousChange = change;
        }
    }

    [Fact]
    public async Task GetTopMovers_ReturnsCoinDtoShape()
    {
        var response = await _client.GetAsync("/api/movers?limit=1");
        var movers = await response.Content.ReadFromJsonAsync<JsonElement>(_jsonOptions);
        var firstGainer = movers.GetProperty("gainers")[0];

        Assert.True(firstGainer.TryGetProperty("id", out _), "Missing 'id'");
        Assert.True(firstGainer.TryGetProperty("name", out _), "Missing 'name'");
        Assert.True(firstGainer.TryGetProperty("symbol", out _), "Missing 'symbol'");
        Assert.True(firstGainer.TryGetProperty("price", out _), "Missing 'price'");
        Assert.True(firstGainer.TryGetProperty("change24h", out _), "Missing 'change24h'");
        Assert.True(firstGainer.TryGetProperty("marketCap", out _), "Missing 'marketCap'");
    }
}
