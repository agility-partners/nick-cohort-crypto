using CryptoApi.DTOs;
using CryptoApi.Services;
using Microsoft.AspNetCore.Mvc;

namespace CryptoApi.Controllers;

[ApiController]
[Route("api/movers")]
public class MoversController : ControllerBase
{
    private readonly ICoinService _coinService;

    public MoversController(ICoinService coinService)
    {
        _coinService = coinService;
    }

    [HttpGet]
    public async Task<ActionResult<TopMoversDto>> GetTopMovers([FromQuery] int limit = 5)
    {
        if (limit < 1) limit = 1;
        if (limit > 20) limit = 20;

        var movers = await _coinService.GetTopMovers(limit);
        return Ok(movers);
    }
}
