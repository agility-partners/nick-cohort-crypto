using CryptoApi.DTOs;

namespace CryptoApi.Services;

public interface ICoinService
{
    Task<IReadOnlyList<CoinDto>> GetAllCoins();

    Task<CoinDto?> GetCoinById(string id);

    Task<CoinDto?> GetCoinBySymbol(string symbol);

    Task<MarketSummaryDto> GetMarketSummary();

    Task<TopMoversDto> GetTopMovers(int limit);

    Task<IReadOnlyList<CoinDto>> GetWatchlist();

    Task<AddToWatchlistResult?> AddToWatchlist(string coinId);

    Task<bool> RemoveFromWatchlist(string coinId);
}
