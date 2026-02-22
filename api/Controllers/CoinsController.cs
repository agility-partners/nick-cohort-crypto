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
}
