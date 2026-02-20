using CryptoApi.DTOs;
using CryptoApi.Models;

namespace CryptoApi.Services;

public interface ICoinService
{
    Task<IReadOnlyList<CoinDto>> GetAllCoins();

    Task<CoinDto?> GetCoinById(string id);

    Task<IReadOnlyList<WatchlistItem>> GetWatchlist();

    Task<WatchlistItem> AddToWatchlist(string coinId);

    Task RemoveFromWatchlist(string coinId);
}
