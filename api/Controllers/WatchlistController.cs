using CryptoApi.DTOs;
using CryptoApi.Services;
using Microsoft.AspNetCore.Mvc;

namespace CryptoApi.Controllers;

[ApiController]
[Route("api/watchlist")]
public class WatchlistController : ControllerBase
{
    private readonly ICoinService _coinService;

    public WatchlistController(ICoinService coinService)
    {
        _coinService = coinService;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<CoinDto>>> GetWatchlist()
    {
        var watchlist = await _coinService.GetWatchlist();
        return Ok(watchlist);
    }

    [HttpPost]
    public async Task<ActionResult<CoinDto>> AddToWatchlist([FromBody] AddWatchlistRequest request)
    {
        var result = await _coinService.AddToWatchlist(request.CoinId);

        if (result is null)
        {
            return NotFound();
        }

        if (result.IsConflict)
        {
            return Conflict(result.Coin);
        }

        return CreatedAtAction(
            actionName: nameof(CoinsController.GetCoinById),
            controllerName: "Coins",
            routeValues: new { id = result.Coin!.Id },
            value: result.Coin);
    }

    [HttpDelete("{coinId}")]
    public async Task<ActionResult> RemoveFromWatchlist(string coinId)
    {
        var removed = await _coinService.RemoveFromWatchlist(coinId);
        if (!removed)
        {
            return NotFound();
        }

        return NoContent();
    }
}
