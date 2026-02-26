using CryptoApi.DTOs;
using CryptoApi.Models;
using Microsoft.Data.SqlClient;

namespace CryptoApi.Services;

public class DatabaseCoinService : ICoinService
{
    private readonly ILogger<DatabaseCoinService> _logger;
    private readonly string _connectionString;
    private readonly List<WatchlistItem> _watchlist = [];

    public DatabaseCoinService(ILogger<DatabaseCoinService> logger, IConfiguration configuration)
    {
        _logger = logger;
        _connectionString = configuration.GetConnectionString("CoinSightDb") ?? string.Empty;
    }

    public async Task<IReadOnlyList<CoinDto>> GetAllCoins()
    {
        const string query = """
            SELECT
                id,
                name,
                symbol,
                price,
                change24h,
                marketCap,
                volume24h,
                image,
                circulatingSupply,
                allTimeHigh,
                allTimeLow
            FROM gold.fct_coins
            ORDER BY marketCap DESC
            """;

        var result = new List<CoinDto>();

        await using var connection = new SqlConnection(_connectionString);
        await connection.OpenAsync();

        await using var command = new SqlCommand(query, connection);
        await using var reader = await command.ExecuteReaderAsync();

        while (await reader.ReadAsync())
        {
            result.Add(MapReaderToCoinDto(reader));
        }

        _logger.LogInformation("Fetched all coins from database. Total: {CoinCount}", result.Count);
        return result;
    }

    public async Task<CoinDto?> GetCoinById(string id)
    {
        const string query = """
            SELECT
                id,
                name,
                symbol,
                price,
                change24h,
                marketCap,
                volume24h,
                image,
                circulatingSupply,
                allTimeHigh,
                allTimeLow
            FROM gold.fct_coins
            WHERE id = @Id
            """;

        await using var connection = new SqlConnection(_connectionString);
        await connection.OpenAsync();

        await using var command = new SqlCommand(query, connection);
        command.Parameters.AddWithValue("@Id", id);

        await using var reader = await command.ExecuteReaderAsync();

        if (!await reader.ReadAsync())
        {
            _logger.LogWarning("Coin not found in database: {CoinId}", id);
            return null;
        }

        var coin = MapReaderToCoinDto(reader);
        _logger.LogInformation("Retrieved coin from database: {CoinId}", id);
        return coin;
    }

    public async Task<IReadOnlyList<CoinDto>> GetWatchlist()
    {
        var watchlistCoinIds = _watchlist
            .Select(item => item.CoinId)
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        var allCoins = await GetAllCoins();
        var result = allCoins
            .Where(coin => watchlistCoinIds.Contains(coin.Id))
            .ToList();

        _logger.LogInformation("Fetched watchlist. Total: {WatchlistCount}", result.Count);
        return result;
    }

    public async Task<AddToWatchlistResult?> AddToWatchlist(string coinId)
    {
        var coin = await GetCoinById(coinId);

        if (coin is null)
        {
            _logger.LogWarning("Add to watchlist failed — coin not found: {CoinId}", coinId);
            return null;
        }

        var existsInWatchlist = _watchlist.Any(item =>
            string.Equals(item.CoinId, coinId, StringComparison.OrdinalIgnoreCase));

        if (existsInWatchlist)
        {
            _logger.LogWarning("Add to watchlist conflict — already exists: {CoinId}", coinId);
            return new AddToWatchlistResult
            {
                IsConflict = true,
                Coin = coin,
            };
        }

        _watchlist.Add(new WatchlistItem
        {
            Id = Guid.NewGuid(),
            CoinId = coin.Id,
            AddedAt = DateTime.UtcNow,
        });

        _logger.LogInformation("Coin added to watchlist: {CoinId}", coinId);
        return new AddToWatchlistResult
        {
            IsConflict = false,
            Coin = coin,
        };
    }

    public Task<bool> RemoveFromWatchlist(string coinId)
    {
        var watchlistItem = _watchlist.FirstOrDefault(item =>
            string.Equals(item.CoinId, coinId, StringComparison.OrdinalIgnoreCase));

        if (watchlistItem is null)
        {
            _logger.LogWarning("Remove from watchlist failed — not found: {CoinId}", coinId);
            return Task.FromResult(false);
        }

        _watchlist.Remove(watchlistItem);
        _logger.LogInformation("Coin removed from watchlist: {CoinId}", coinId);
        return Task.FromResult(true);
    }

    private static CoinDto MapReaderToCoinDto(SqlDataReader reader)
    {
        return new CoinDto
        {
            Id = reader.GetString(reader.GetOrdinal("id")),
            Name = reader.GetString(reader.GetOrdinal("name")),
            Symbol = reader.GetString(reader.GetOrdinal("symbol")),
            Price = GetDecimal(reader, "price"),
            Change24h = GetDecimal(reader, "change24h"),
            MarketCap = GetDecimal(reader, "marketCap"),
            Volume24h = GetDecimal(reader, "volume24h"),
            Image = reader.IsDBNull(reader.GetOrdinal("image"))
                ? string.Empty
                : reader.GetString(reader.GetOrdinal("image")),
            CirculatingSupply = GetDecimal(reader, "circulatingSupply"),
            AllTimeHigh = GetDecimal(reader, "allTimeHigh"),
            AllTimeLow = GetDecimal(reader, "allTimeLow"),
        };
    }

    private static decimal GetDecimal(SqlDataReader reader, string columnName)
    {
        var ordinal = reader.GetOrdinal(columnName);
        return reader.IsDBNull(ordinal) ? 0m : reader.GetDecimal(ordinal);
    }
}
