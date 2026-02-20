using CryptoApi.DTOs;
using CryptoApi.Models;

namespace CryptoApi.Services;

public class CoinService : ICoinService
{
    public Task<IReadOnlyList<CoinDto>> GetAllCoins()
    {
        throw new NotImplementedException();
    }

    public Task<CoinDto?> GetCoinById(string id)
    {
        throw new NotImplementedException();
    }

    public Task<IReadOnlyList<WatchlistItem>> GetWatchlist()
    {
        throw new NotImplementedException();
    }

    public Task<WatchlistItem> AddToWatchlist(string coinId)
    {
        throw new NotImplementedException();
    }

    public Task RemoveFromWatchlist(string coinId)
    {
        throw new NotImplementedException();
    }
}
