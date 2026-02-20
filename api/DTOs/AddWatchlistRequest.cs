using System.ComponentModel.DataAnnotations;

namespace CryptoApi.DTOs;

public class AddWatchlistRequest
{
    [Required]
    public string CoinId { get; set; } = string.Empty;
}
