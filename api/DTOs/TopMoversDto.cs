namespace CryptoApi.DTOs;

public class TopMoversDto
{
    public IReadOnlyList<CoinDto> Gainers { get; set; } = [];
    public IReadOnlyList<CoinDto> Losers { get; set; } = [];
}
