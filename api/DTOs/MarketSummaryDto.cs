namespace CryptoApi.DTOs;

public class MarketSummaryDto
{
    public decimal TotalMarketCap { get; set; }
    public decimal TotalVolume24h { get; set; }
    public int Advancers { get; set; }
    public int Decliners { get; set; }
    public int Unchanged { get; set; }
    public decimal? BitcoinDominance { get; set; }
}
