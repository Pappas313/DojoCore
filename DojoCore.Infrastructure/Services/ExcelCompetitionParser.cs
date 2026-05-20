using System.Text.RegularExpressions;
using DojoCore.Application.Interfaces;
using DojoCore.Domain.Entities;
using ExcelDataReader;

namespace DojoCore.Infrastructure.Services;

public partial class ExcelCompetitionParser : IExcelCompetitionParser
{
    // Matches: ATHLETE NAME [COUNTRY - CLUB]
    [GeneratedRegex(@"^(.+?)\s*\[([A-Z]+)\s*-\s*(.+)\]\s*$")]
    private static partial Regex AthleteRegex();

    // Extracts weight class from category, e.g. "ΑΝΔΡΩΝ ( 54- )" -> "54-"
    [GeneratedRegex(@"\(\s*(.+?)\s*\)")]
    private static partial Regex WeightClassRegex();

    private static readonly Dictionary<string, short> PlacementMap = new(StringComparer.OrdinalIgnoreCase)
    {
        ["1ος"] = 1,
        ["2ος"] = 2,
        ["3ος"] = 3,
        ["1η"]  = 1,
        ["2η"]  = 2,
        ["3η"]  = 3
    };

    public (string tournament, List<CompetitionResult> results) Parse(Stream stream, string fileName)
    {
        System.Text.Encoding.RegisterProvider(System.Text.CodePagesEncodingProvider.Instance);

        var tournament = string.Empty;
        var results    = new List<CompetitionResult>();

        using var reader = fileName.EndsWith(".xlsx", StringComparison.OrdinalIgnoreCase)
            ? ExcelReaderFactory.CreateOpenXmlReader(stream)
            : ExcelReaderFactory.CreateBinaryReader(stream);

        var dataSet = reader.AsDataSet(new ExcelDataSetConfiguration
        {
            ConfigureDataTable = _ => new ExcelDataTableConfiguration { UseHeaderRow = false }
        });

        if (dataSet.Tables.Count == 0) return (tournament, results);

        var table = dataSet.Tables[0];

        // Row 0 is the header row — column index 2 contains the tournament name
        if (table.Rows.Count > 0)
            tournament = table.Rows[0][2]?.ToString()?.Trim() ?? string.Empty;

        for (var rowIdx = 1; rowIdx < table.Rows.Count; rowIdx++)
        {
            var row         = table.Rows[rowIdx];
            var medalCell   = row[1]?.ToString()?.Trim() ?? string.Empty;
            var athleteCell = row[2]?.ToString()?.Trim() ?? string.Empty;
            var catCell     = row[3]?.ToString()?.Trim() ?? string.Empty;

            // Skip empty rows and group separator rows (athlete cell value == category cell value)
            if (string.IsNullOrWhiteSpace(athleteCell)) continue;
            if (string.Equals(athleteCell, catCell, StringComparison.OrdinalIgnoreCase)) continue;
            if (!PlacementMap.TryGetValue(medalCell, out var placement)) continue;

            var athleteMatch = AthleteRegex().Match(athleteCell);
            if (!athleteMatch.Success) continue;

            var name    = athleteMatch.Groups[1].Value.Trim();
            var country = athleteMatch.Groups[2].Value.Trim();
            var club    = athleteMatch.Groups[3].Value.Trim();

            var weightMatch = WeightClassRegex().Match(catCell);
            var weightClass = weightMatch.Success ? weightMatch.Groups[1].Value.Trim() : string.Empty;
            var gender      = catCell.StartsWith("ΓΥΝΑΙΚΩΝ", StringComparison.OrdinalIgnoreCase)
                                  ? "ΓΥΝΑΙΚΩΝ"
                                  : "ΑΝΔΡΩΝ";

            results.Add(new CompetitionResult
            {
                Category    = catCell,
                Gender      = gender,
                WeightClass = weightClass,
                Placement   = placement,
                AthleteName = name,
                CountryCode = country,
                ClubName    = club
            });
        }

        return (tournament, results);
    }
}
