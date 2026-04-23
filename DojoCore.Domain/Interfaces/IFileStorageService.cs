namespace DojoCore.Domain.Interfaces;

public interface IFileStorageService
{
    /// <summary>Saves a file stream and returns the stored relative path.</summary>
    Task<string> SaveAsync(Stream content, string fileName, CancellationToken ct = default);
}
