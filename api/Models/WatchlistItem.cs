namespace CryptoApi.Models;

public class WatchlistItem
{
    public Guid Id { get; set; }

    public string CoinId { get; set; } = string.Empty;

    public DateTime AddedAt { get; set; }
}
