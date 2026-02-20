namespace CryptoApi.DTOs;

public class AddToWatchlistResult
{
    public bool IsConflict { get; set; }

    public CoinDto? Coin { get; set; }
}
