using System.Net;
using System.Text;
using Xunit;

namespace CryptoApi.Tests;

public class ErrorHandlingTests : IClassFixture<CoinSightApiFactory>
{
    private readonly HttpClient _client;

    public ErrorHandlingTests(CoinSightApiFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task NotFoundRoute_Returns404_NotHtml()
    {
        var response = await _client.GetAsync("/api/nonexistent");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);

        var contentType = response.Content.Headers.ContentType?.MediaType ?? "";
        Assert.DoesNotContain("text/html", contentType);
    }

    [Fact]
    public async Task InvalidJsonBody_Returns400_AsJson()
    {
        var content = new StringContent("not valid json", Encoding.UTF8, "application/json");

        var response = await _client.PostAsync("/api/watchlist", content);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var contentType = response.Content.Headers.ContentType?.MediaType;
        Assert.Equal("application/problem+json", contentType);
    }
}
