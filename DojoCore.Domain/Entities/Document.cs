namespace DojoCore.Domain.Entities;

public class Document
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid? UserId { get; set; }
    public Guid? GymId { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string FilePath { get; set; } = string.Empty;
    public string? FileType { get; set; }
    public short Status { get; set; } = 0;
    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
}
