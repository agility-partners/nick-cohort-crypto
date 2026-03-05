namespace CryptoApi.DTOs;

public class PriceHistoryPointDto
{
    public string Timestamp { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public decimal MarketCap { get; set; }
    public decimal Volume { get; set; }
}

public class PriceHistoryDto
{
    public IReadOnlyList<PriceHistoryPointDto> Data { get; set; } = [];
}
