namespace DojoCore.Domain.Interfaces;

public interface IGeocodingService
{
    /// <summary>
    /// Resolves a human-readable address to (latitude, longitude).
    /// Returns null if the address cannot be resolved.
    /// </summary>
    Task<(double Latitude, double Longitude)?> GeocodeAsync(string address, CancellationToken ct = default);
}
