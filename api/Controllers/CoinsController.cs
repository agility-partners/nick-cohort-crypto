using CryptoApi.DTOs;
using CryptoApi.Services;
using Microsoft.AspNetCore.Mvc;

namespace CryptoApi.Controllers;

[ApiController]
[Route("api/coins")]
public class CoinsController : ControllerBase
{
    private readonly ICoinService _coinService;

    public CoinsController(ICoinService coinService)
    {
        _coinService = coinService;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<CoinDto>>> GetAllCoins()
    {
        var coins = await _coinService.GetAllCoins();
        return Ok(coins);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<CoinDto>> GetCoinById(string id)
    {
        var coin = await _coinService.GetCoinById(id);
        if (coin is null)
        {
            return NotFound();
        }

        return Ok(coin);
    }

    private static readonly HashSet<string> ValidRanges = new(StringComparer.OrdinalIgnoreCase)
    {
        "1D", "7D", "30D", "90D", "1Y", "ALL",
    };

    [HttpGet("{id}/price-history")]
    public async Task<ActionResult<PriceHistoryDto>> GetPriceHistory(string id, [FromQuery] string range = "30D")
    {
        if (!ValidRanges.Contains(range))
        {
            return BadRequest(new { error = "Invalid range. Valid values: 1D, 7D, 30D, 90D, 1Y, ALL." });
        }

        var coin = await _coinService.GetCoinById(id);
        if (coin is null)
        {
            return NotFound();
        }

        var result = await _coinService.GetPriceHistory(id, range);
        return Ok(result);
    }

    [HttpGet("symbol/{symbol}")]
    public async Task<ActionResult<CoinDto>> GetCoinBySymbol(string symbol)
    {
        var coin = await _coinService.GetCoinBySymbol(symbol);
        if (coin is null)
        {
            return NotFound();
        }

        return Ok(coin);
    }
}
