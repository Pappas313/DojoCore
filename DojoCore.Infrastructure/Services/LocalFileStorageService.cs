using DojoCore.Domain.Interfaces;

namespace DojoCore.Infrastructure.Services;

public class LocalFileStorageService : IFileStorageService
{
    private readonly string _basePath;

    public LocalFileStorageService(string basePath)
    {
        _basePath = basePath;
        Directory.CreateDirectory(_basePath);
    }

    public async Task<string> SaveAsync(Stream content, string fileName, CancellationToken ct = default)
    {
        var uniqueName = $"{Guid.NewGuid():N}_{Path.GetFileName(fileName)}";
        var fullPath = Path.Combine(_basePath, uniqueName);

        await using var fs = File.Create(fullPath);
        await content.CopyToAsync(fs, ct);

        return uniqueName;
    }
}
