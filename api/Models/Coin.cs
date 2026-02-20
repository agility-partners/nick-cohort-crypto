namespace CryptoApi.Models;

public class Coin
{
    public string Id { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;

    public string Symbol { get; set; } = string.Empty;

    public decimal Price { get; set; }

    public decimal Change24h { get; set; }

    public decimal MarketCap { get; set; }

    public decimal Volume24h { get; set; }

    public string Image { get; set; } = string.Empty;

    public decimal CirculatingSupply { get; set; }

    public decimal AllTimeHigh { get; set; }

    public decimal AllTimeLow { get; set; }
}
