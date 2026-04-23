using DojoCore.Domain.Entities;

namespace DojoCore.Domain.Interfaces;

public interface IDocumentRepository
{
    Task AddRangeAsync(IEnumerable<Document> documents, CancellationToken ct = default);
}
