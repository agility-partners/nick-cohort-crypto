using CryptoApi.DTOs;
using CryptoApi.Services;
using Microsoft.AspNetCore.Mvc;

namespace CryptoApi.Controllers;

[ApiController]
[Route("api/market")]
public class MarketController : ControllerBase
{
    private readonly ICoinService _coinService;

    public MarketController(ICoinService coinService)
    {
        _coinService = coinService;
    }

    [HttpGet("summary")]
    public async Task<ActionResult<MarketSummaryDto>> GetMarketSummary()
    {
        var summary = await _coinService.GetMarketSummary();
        return Ok(summary);
    }
}
