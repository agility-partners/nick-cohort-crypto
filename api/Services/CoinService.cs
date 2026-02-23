using CryptoApi.DTOs;
using CryptoApi.Models;

namespace CryptoApi.Services;

public class CoinService : ICoinService
{
    private readonly ILogger<CoinService> _logger;

    public CoinService(ILogger<CoinService> logger)
    {
        _logger = logger;
    }

    private static readonly List<Coin> Coins =
    [
        new()
        {
            Id = "bitcoin",
            Name = "Bitcoin",
            Symbol = "BTC",
            Price = 68245.12m,
            Change24h = 2.14m,
            MarketCap = 1340000000000m,
            Volume24h = 31200000000m,
            Image = "https://coin-images.coingecko.com/coins/images/1/small/bitcoin.png",
            CirculatingSupply = 19000000m,
            AllTimeHigh = 69000m,
            AllTimeLow = 65m,
        },
        new()
        {
            Id = "ethereum",
            Name = "Ethereum",
            Symbol = "ETH",
            Price = 3489.77m,
            Change24h = -1.08m,
            MarketCap = 419000000000m,
            Volume24h = 16800000000m,
            Image = "https://coin-images.coingecko.com/coins/images/279/small/ethereum.png",
            CirculatingSupply = 120000000m,
            AllTimeHigh = 4800m,
            AllTimeLow = 0.42m,
        },
        new()
        {
            Id = "solana",
            Name = "Solana",
            Symbol = "SOL",
            Price = 161.43m,
            Change24h = 4.62m,
            MarketCap = 74400000000m,
            Volume24h = 2900000000m,
            Image = "https://coin-images.coingecko.com/coins/images/4128/small/solana.png",
            CirculatingSupply = 370000000m,
            AllTimeHigh = 260m,
            AllTimeLow = 0.5m,
        },
        new()
        {
            Id = "cardano",
            Name = "Cardano",
            Symbol = "ADA",
            Price = 0.74m,
            Change24h = -0.89m,
            MarketCap = 26200000000m,
            Volume24h = 680000000m,
            Image = "https://coin-images.coingecko.com/coins/images/975/small/cardano.png",
            CirculatingSupply = 35000000000m,
            AllTimeHigh = 3.1m,
            AllTimeLow = 0.02m,
        },
        new()
        {
            Id = "ripple",
            Name = "XRP",
            Symbol = "XRP",
            Price = 0.63m,
            Change24h = 1.73m,
            MarketCap = 34700000000m,
            Volume24h = 1240000000m,
            Image = "https://coin-images.coingecko.com/coins/images/44/small/xrp-symbol-white-128.png",
            CirculatingSupply = 55000000000m,
            AllTimeHigh = 3.84m,
            AllTimeLow = 0.002m,
        },
        new()
        {
            Id = "binancecoin",
            Name = "BNB",
            Symbol = "BNB",
            Price = 578.21m,
            Change24h = -2.31m,
            MarketCap = 84200000000m,
            Volume24h = 1570000000m,
            Image = "https://coin-images.coingecko.com/coins/images/825/small/bnb-icon2_2x.png",
            CirculatingSupply = 156000000m,
            AllTimeHigh = 686m,
            AllTimeLow = 0.0398m,
        },
        new()
        {
            Id = "dogecoin",
            Name = "Dogecoin",
            Symbol = "DOGE",
            Price = 0.15m,
            Change24h = 5.04m,
            MarketCap = 21900000000m,
            Volume24h = 930000000m,
            Image = "https://coin-images.coingecko.com/coins/images/5/small/dogecoin.png",
            CirculatingSupply = 145000000000m,
            AllTimeHigh = 0.74m,
            AllTimeLow = 0.0002m,
        },
        new()
        {
            Id = "avalanche",
            Name = "Avalanche",
            Symbol = "AVAX",
            Price = 38.56m,
            Change24h = -1.44m,
            MarketCap = 14600000000m,
            Volume24h = 540000000m,
            Image = "https://coin-images.coingecko.com/coins/images/12559/small/Avalanche_Circle_RedWhite_Trans.png",
            CirculatingSupply = 380000000m,
            AllTimeHigh = 145m,
            AllTimeLow = 0.26m,
        },
        new()
        {
            Id = "polkadot",
            Name = "Polkadot",
            Symbol = "DOT",
            Price = 7.82m,
            Change24h = 3.15m,
            MarketCap = 10700000000m,
            Volume24h = 320000000m,
            Image = "https://coin-images.coingecko.com/coins/images/12171/small/polkadot.png",
            CirculatingSupply = 1368000000m,
            AllTimeHigh = 54.98m,
            AllTimeLow = 0.12m,
        },
        new()
        {
            Id = "chainlink",
            Name = "Chainlink",
            Symbol = "LINK",
            Price = 18.45m,
            Change24h = 1.92m,
            MarketCap = 11200000000m,
            Volume24h = 580000000m,
            Image = "https://coin-images.coingecko.com/coins/images/877/small/chainlink-new-logo.png",
            CirculatingSupply = 607000000m,
            AllTimeHigh = 52m,
            AllTimeLow = 0.09m,
        },
        new()
        {
            Id = "polygon",
            Name = "Polygon",
            Symbol = "MATIC",
            Price = 0.58m,
            Change24h = -2.67m,
            MarketCap = 5400000000m,
            Volume24h = 290000000m,
            Image = "https://coin-images.coingecko.com/coins/images/4713/small/polygon.png",
            CirculatingSupply = 9300000000m,
            AllTimeHigh = 2.92m,
            AllTimeLow = 0.003m,
        },
        new()
        {
            Id = "litecoin",
            Name = "Litecoin",
            Symbol = "LTC",
            Price = 92.34m,
            Change24h = 0.87m,
            MarketCap = 6900000000m,
            Volume24h = 410000000m,
            Image = "https://coin-images.coingecko.com/coins/images/2/small/litecoin.png",
            CirculatingSupply = 73500000m,
            AllTimeHigh = 420m,
            AllTimeLow = 1.15m,
        },
        new()
        {
            Id = "uniswap",
            Name = "Uniswap",
            Symbol = "UNI",
            Price = 11.27m,
            Change24h = -3.41m,
            MarketCap = 8500000000m,
            Volume24h = 260000000m,
            Image = "https://cryptologos.cc/logos/uniswap-uni-logo.png",
            CirculatingSupply = 750000000m,
            AllTimeHigh = 44.92m,
            AllTimeLow = 0.44m,
        },
        new()
        {
            Id = "cosmos",
            Name = "Cosmos",
            Symbol = "ATOM",
            Price = 9.14m,
            Change24h = 2.08m,
            MarketCap = 3600000000m,
            Volume24h = 180000000m,
            Image = "https://coin-images.coingecko.com/coins/images/1481/small/cosmos_hub.png",
            CirculatingSupply = 392000000m,
            AllTimeHigh = 20.15m,
            AllTimeLow = 0.51m,
        },
        new()
        {
            Id = "stellar",
            Name = "Stellar",
            Symbol = "XLM",
            Price = 0.12m,
            Change24h = 1.35m,
            MarketCap = 3500000000m,
            Volume24h = 120000000m,
            Image = "https://coin-images.coingecko.com/coins/images/100/small/Stellar_symbol_black_RGB.png",
            CirculatingSupply = 29000000000m,
            AllTimeHigh = 0.88m,
            AllTimeLow = 0.0009m,
        },
        new()
        {
            Id = "near",
            Name = "NEAR Protocol",
            Symbol = "NEAR",
            Price = 5.67m,
            Change24h = 6.23m,
            MarketCap = 6200000000m,
            Volume24h = 340000000m,
            Image = "https://coin-images.coingecko.com/coins/images/10365/small/near.jpg",
            CirculatingSupply = 1090000000m,
            AllTimeHigh = 20.76m,
            AllTimeLow = 0.098m,
        },
        new()
        {
            Id = "filecoin",
            Name = "Filecoin",
            Symbol = "FIL",
            Price = 5.89m,
            Change24h = -1.76m,
            MarketCap = 3200000000m,
            Volume24h = 150000000m,
            Image = "https://coin-images.coingecko.com/coins/images/12817/small/filecoin.png",
            CirculatingSupply = 543000000m,
            AllTimeHigh = 209m,
            AllTimeLow = 0.49m,
        },
        new()
        {
            Id = "arbitrum",
            Name = "Arbitrum",
            Symbol = "ARB",
            Price = 1.14m,
            Change24h = 4.38m,
            MarketCap = 4600000000m,
            Volume24h = 420000000m,
            Image = "https://coin-images.coingecko.com/coins/images/16547/small/photo_2023-03-29_21.47.00.jpeg",
            CirculatingSupply = 4030000000m,
            AllTimeHigh = 2.81m,
            AllTimeLow = 0.61m,
        },
        new()
        {
            Id = "optimism",
            Name = "Optimism",
            Symbol = "OP",
            Price = 2.53m,
            Change24h = 3.72m,
            MarketCap = 3100000000m,
            Volume24h = 210000000m,
            Image = "https://coin-images.coingecko.com/coins/images/25244/small/Optimism.png",
            CirculatingSupply = 1220000000m,
            AllTimeHigh = 4.68m,
            AllTimeLow = 0.34m,
        },
        new()
        {
            Id = "aptos",
            Name = "Aptos",
            Symbol = "APT",
            Price = 8.91m,
            Change24h = -2.19m,
            MarketCap = 3900000000m,
            Volume24h = 190000000m,
            Image = "https://coin-images.coingecko.com/coins/images/26455/small/aptos_round.png",
            CirculatingSupply = 436000000m,
            AllTimeHigh = 13.14m,
            AllTimeLow = 7.16m,
        },
        new()
        {
            Id = "sui",
            Name = "Sui",
            Symbol = "SUI",
            Price = 1.47m,
            Change24h = 7.84m,
            MarketCap = 4100000000m,
            Volume24h = 380000000m,
            Image = "https://coin-images.coingecko.com/coins/images/26375/small/sui-ocean-square.png",
            CirculatingSupply = 2790000000m,
            AllTimeHigh = 4.27m,
            AllTimeLow = 0.28m,
        },
        new()
        {
            Id = "toncoin",
            Name = "Toncoin",
            Symbol = "TON",
            Price = 5.32m,
            Change24h = 1.16m,
            MarketCap = 13200000000m,
            Volume24h = 270000000m,
            Image = "https://coin-images.coingecko.com/coins/images/17980/small/ton_symbol.png",
            CirculatingSupply = 2479000000m,
            AllTimeHigh = 8.92m,
            AllTimeLow = 0.42m,
        },
        new()
        {
            Id = "render",
            Name = "Render",
            Symbol = "RNDR",
            Price = 7.62m,
            Change24h = 5.47m,
            MarketCap = 3800000000m,
            Volume24h = 310000000m,
            Image = "https://coin-images.coingecko.com/coins/images/11636/small/rndr.png",
            CirculatingSupply = 498000000m,
            AllTimeHigh = 27.02m,
            AllTimeLow = 0.4m,
        },
        new()
        {
            Id = "injective",
            Name = "Injective",
            Symbol = "INJ",
            Price = 24.18m,
            Change24h = -0.93m,
            MarketCap = 2400000000m,
            Volume24h = 140000000m,
            Image = "https://coin-images.coingecko.com/coins/images/12882/small/Secondary_Symbol.png",
            CirculatingSupply = 99000000m,
            AllTimeHigh = 52.9m,
            AllTimeLow = 0.41m,
        },
    ];

    private readonly List<WatchlistItem> _watchlist = [];

    public Task<IReadOnlyList<CoinDto>> GetAllCoins()
    {
        var result = Coins.Select(MapToCoinDto).ToList();
        _logger.LogInformation("Fetched all coins. Total: {CoinCount}", result.Count);
        return Task.FromResult<IReadOnlyList<CoinDto>>(result);
    }

    public Task<CoinDto?> GetCoinById(string id)
    {
        var coin = Coins.FirstOrDefault(currentCoin =>
            string.Equals(currentCoin.Id, id, StringComparison.OrdinalIgnoreCase));

        if (coin is null)
        {
            _logger.LogWarning("Coin not found: {CoinId}", id);
            return Task.FromResult<CoinDto?>(null);
        }

        _logger.LogInformation("Retrieved coin: {CoinId}", id);
        return Task.FromResult<CoinDto?>(MapToCoinDto(coin));
    }

    public Task<IReadOnlyList<CoinDto>> GetWatchlist()
    {
        var watchlistCoinIds = _watchlist
            .Select(item => item.CoinId)
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        var result = Coins
            .Where(coin => watchlistCoinIds.Contains(coin.Id))
            .Select(MapToCoinDto)
            .ToList();

        _logger.LogInformation("Fetched watchlist. Total: {WatchlistCount}", result.Count);
        return Task.FromResult<IReadOnlyList<CoinDto>>(result);
    }

    public Task<AddToWatchlistResult?> AddToWatchlist(string coinId)
    {
        var coin = Coins.FirstOrDefault(currentCoin =>
            string.Equals(currentCoin.Id, coinId, StringComparison.OrdinalIgnoreCase));

        if (coin is null)
        {
            _logger.LogWarning("Add to watchlist failed — coin not found: {CoinId}", coinId);
            return Task.FromResult<AddToWatchlistResult?>(null);
        }

        var existsInWatchlist = _watchlist.Any(item =>
            string.Equals(item.CoinId, coinId, StringComparison.OrdinalIgnoreCase));

        if (existsInWatchlist)
        {
            _logger.LogWarning("Add to watchlist conflict — already exists: {CoinId}", coinId);
            var conflictResult = new AddToWatchlistResult
            {
                IsConflict = true,
                Coin = MapToCoinDto(coin),
            };

            return Task.FromResult<AddToWatchlistResult?>(conflictResult);
        }

        _watchlist.Add(new WatchlistItem
        {
            Id = Guid.NewGuid(),
            CoinId = coin.Id,
            AddedAt = DateTime.UtcNow,
        });

        _logger.LogInformation("Coin added to watchlist: {CoinId}", coinId);
        var successResult = new AddToWatchlistResult
        {
            IsConflict = false,
            Coin = MapToCoinDto(coin),
        };

        return Task.FromResult<AddToWatchlistResult?>(successResult);
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

    private static CoinDto MapToCoinDto(Coin coin)
    {
        return new CoinDto
        {
            Id = coin.Id,
            Name = coin.Name,
            Symbol = coin.Symbol,
            Price = coin.Price,
            Change24h = coin.Change24h,
            MarketCap = coin.MarketCap,
            Volume24h = coin.Volume24h,
            Image = coin.Image,
            CirculatingSupply = coin.CirculatingSupply,
            AllTimeHigh = coin.AllTimeHigh,
            AllTimeLow = coin.AllTimeLow,
        };
    }
}
