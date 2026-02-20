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
    public async Task<IActionResult> GetWatchlist()
    {
        var watchlist = await _coinService.GetWatchlist();
        return Ok(watchlist);
    }

    [HttpPost]
    public async Task<IActionResult> AddToWatchlist([FromBody] AddWatchlistRequest request)
    {
        var addedItem = await _coinService.AddToWatchlist(request.CoinId);
        return Ok(addedItem);
    }

    [HttpDelete("{coinId}")]
    public async Task<IActionResult> RemoveFromWatchlist(string coinId)
    {
        await _coinService.RemoveFromWatchlist(coinId);
        return NoContent();
    }
}
