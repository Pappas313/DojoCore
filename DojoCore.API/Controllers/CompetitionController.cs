using DojoCore.Application.DTOs.Competition;
using DojoCore.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace DojoCore.API.Controllers;

/// <summary>
/// Import competition results from Excel and retrieve them for the grouped grid.
/// </summary>
[ApiController]
[Route("api/competitions")]
[Tags("Competitions")]
[Produces("application/json")]
public class CompetitionController : ControllerBase
{
    private readonly ICompetitionService _competitionService;

    public CompetitionController(ICompetitionService competitionService)
    {
        _competitionService = competitionService;
    }

    /// <summary>Imports an Excel file (.xls or .xlsx) into the database.</summary>
    /// <param name="file">Excel file to import.</param>
    /// <param name="title">User-provided grouping title displayed on the results grid.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <response code="200">Import summary with importId, rowsImported and categories list.</response>
    /// <response code="400">Missing file, unsupported format, or parse error.</response>
    [HttpPost("import")]
    [Consumes("multipart/form-data")]
    [ProducesResponseType(typeof(ImportCompetitionResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Import(
        IFormFile file,
        [FromForm] string title,
        CancellationToken ct)
    {
        if (file is null || file.Length == 0)
            return BadRequest(new { error = "BadRequest", message = "No file was uploaded." });

        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (ext is not (".xls" or ".xlsx"))
            return BadRequest(new { error = "BadRequest", message = "Only .xls and .xlsx files are supported." });

        if (string.IsNullOrWhiteSpace(title))
            return BadRequest(new { error = "BadRequest", message = "Title is required." });

        try
        {
            await using var stream = file.OpenReadStream();
            var result = await _competitionService.ImportAsync(stream, file.FileName, title, importedBy: null, ct);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = "ParseError", message = ex.Message });
        }
    }

    /// <summary>Returns all competition imports (summary list for the import history grid).</summary>
    /// <param name="ct">Cancellation token.</param>
    /// <response code="200">List of import summaries.</response>
    [HttpGet]
    [ProducesResponseType(typeof(List<CompetitionImportListItemDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var imports = await _competitionService.GetAllImportsAsync(ct);
        return Ok(imports);
    }

    /// <summary>Returns all athlete results across all imports, ordered by import title → category → placement. Used by the grouped list grid.</summary>
    /// <param name="ct">Cancellation token.</param>
    /// <response code="200">Flat list of all results enriched with import title and tournament.</response>
    [HttpGet("results")]
    [ProducesResponseType(typeof(List<CompetitionResultWithImportDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllResults(CancellationToken ct)
    {
        var results = await _competitionService.GetAllResultsAsync(ct);
        return Ok(results);
    }

    /// <summary>Returns all athlete results for a given import, ordered by category then placement.</summary>
    /// <param name="importId">Import identifier.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <response code="200">Results response with import metadata and grouped result rows.</response>
    /// <response code="404">Import not found.</response>
    [HttpGet("{importId:guid}/results")]
    [ProducesResponseType(typeof(CompetitionResultsResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetResults(Guid importId, CancellationToken ct)
    {
        var response = await _competitionService.GetResultsAsync(importId, ct);
        if (response is null)
            return NotFound(new { error = "NotFound", message = $"Competition import '{importId}' was not found." });

        return Ok(response);
    }

    /// <summary>Deletes a competition import and all its results (cascade).</summary>
    /// <param name="importId">Import identifier.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <response code="204">Import deleted.</response>
    /// <response code="404">Import not found.</response>
    [HttpDelete("{importId:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid importId, CancellationToken ct)
    {
        try
        {
            await _competitionService.DeleteImportAsync(importId, ct);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = "NotFound", message = ex.Message });
        }
    }
}
