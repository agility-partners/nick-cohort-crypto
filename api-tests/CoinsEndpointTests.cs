using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Xunit;

namespace CryptoApi.Tests;

public class CoinsEndpointTests : IClassFixture<CoinSightApiFactory>
{
    private readonly HttpClient _client;
    private readonly JsonSerializerOptions _jsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    public CoinsEndpointTests(CoinSightApiFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetAllCoins_Returns200WithAllCoins()
    {
        var response = await _client.GetAsync("/api/coins");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var coins = await response.Content.ReadFromJsonAsync<JsonElement[]>(_jsonOptions);
        Assert.NotNull(coins);
        Assert.Equal(24, coins.Length);
    }

    [Fact]
    public async Task GetAllCoins_ReturnsCoinDtoShape()
    {
        var response = await _client.GetAsync("/api/coins");
        var coins = await response.Content.ReadFromJsonAsync<JsonElement[]>(_jsonOptions);

        Assert.NotNull(coins);
        var first = coins[0];

        // Verify all expected CoinDto properties exist
        Assert.True(first.TryGetProperty("id", out _), "Missing 'id' property");
        Assert.True(first.TryGetProperty("name", out _), "Missing 'name' property");
        Assert.True(first.TryGetProperty("symbol", out _), "Missing 'symbol' property");
        Assert.True(first.TryGetProperty("price", out _), "Missing 'price' property");
        Assert.True(first.TryGetProperty("marketCap", out _), "Missing 'marketCap' property");
        Assert.True(first.TryGetProperty("change24h", out _), "Missing 'change24h' property");
        Assert.True(first.TryGetProperty("volume24h", out _), "Missing 'volume24h' property");
        Assert.True(first.TryGetProperty("image", out _), "Missing 'image' property");
        Assert.True(first.TryGetProperty("circulatingSupply", out _), "Missing 'circulatingSupply' property");
        Assert.True(first.TryGetProperty("allTimeHigh", out _), "Missing 'allTimeHigh' property");
        Assert.True(first.TryGetProperty("allTimeLow", out _), "Missing 'allTimeLow' property");
    }

    [Fact]
    public async Task GetCoinById_ValidId_Returns200()
    {
        var response = await _client.GetAsync("/api/coins/bitcoin");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var coin = await response.Content.ReadFromJsonAsync<JsonElement>(_jsonOptions);
        Assert.Equal("bitcoin", coin.GetProperty("id").GetString());
        Assert.Equal("Bitcoin", coin.GetProperty("name").GetString());
        Assert.Equal("BTC", coin.GetProperty("symbol").GetString());
    }

    [Fact]
    public async Task GetCoinById_InvalidId_Returns404()
    {
        var response = await _client.GetAsync("/api/coins/fakecoin");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task GetCoinById_CaseInsensitive_Returns200()
    {
        var response = await _client.GetAsync("/api/coins/BITCOIN");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var coin = await response.Content.ReadFromJsonAsync<JsonElement>(_jsonOptions);
        Assert.Equal("bitcoin", coin.GetProperty("id").GetString());
    }
}
