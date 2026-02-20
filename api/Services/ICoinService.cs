using CryptoApi.DTOs;

namespace CryptoApi.Services;

public interface ICoinService
{
    Task<IReadOnlyList<CoinDto>> GetAllCoins();

    Task<CoinDto?> GetCoinById(string id);

    Task<IReadOnlyList<CoinDto>> GetWatchlist();

    Task<AddToWatchlistResult?> AddToWatchlist(string coinId);

    Task<bool> RemoveFromWatchlist(string coinId);
}
