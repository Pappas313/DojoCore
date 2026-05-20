using DojoCore.Domain.Entities;

namespace DojoCore.Application.Interfaces;

public interface IExcelCompetitionParser
{
    (string tournament, List<CompetitionResult> results) Parse(Stream stream, string fileName);
}
