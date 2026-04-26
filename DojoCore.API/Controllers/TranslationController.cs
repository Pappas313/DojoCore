using DojoCore.Application.DTOs.Translation;
using DojoCore.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DojoCore.API.Controllers;

/// <summary>
/// Manages i18n translations stored in the database.
/// </summary>
[ApiController]
[Route("api/translations")]
[Tags("Translations")]
[Produces("application/json")]
public class TranslationController : ControllerBase
{
    private readonly ITranslationService _translationService;

    public TranslationController(ITranslationService translationService)
    {
        _translationService = translationService;
    }

    /// <summary>
    /// Returns a flat key/value map for the given language and page.
    /// Used as the i18next-http-backend loadPath endpoint.
    /// </summary>
    /// <param name="language">Language code (e.g. "en", "gr").</param>
    /// <param name="page">Page/namespace identifier.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <response code="200">Flat key/value JSON object (empty object if no rows found).</response>
    [HttpGet("{language}/{page}")]
    [ProducesResponseType(typeof(Dictionary<string, string>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetFlat(string language, string page, CancellationToken ct)
    {
        var result = await _translationService.GetFlatAsync(language, page, ct);
        Response.Headers.CacheControl = "public, max-age=3600";
        return Ok(result);
    }

    /// <summary>
    /// Returns an array of all distinct language codes available in the database.
    /// </summary>
    /// <param name="ct">Cancellation token.</param>
    /// <response code="200">Array of language codes, e.g. ["en", "gr"].</response>
    [HttpGet("languages")]
    [ProducesResponseType(typeof(IEnumerable<string>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetLanguages(CancellationToken ct)
    {
        var languages = await _translationService.GetLanguagesAsync(ct);
        return Ok(languages);
    }

    /// <summary>
    /// Bulk upserts an array of translation rows.
    /// </summary>
    /// <param name="items">Array of translation objects to insert or update.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <response code="200">Counts of inserted and updated rows.</response>
    [HttpPost("bulk")]
    [Authorize(Policy = "AdminOnly")]
    [ProducesResponseType(typeof(BulkUpsertResult), StatusCodes.Status200OK)]
    public async Task<IActionResult> BulkUpsert([FromBody] List<BulkUpsertTranslationItem> items, CancellationToken ct)
    {
        var result = await _translationService.BulkUpsertAsync(items, ct);
        return Ok(result);
    }

    /// <summary>
    /// Returns a paginated list of all translation rows, with optional filtering.
    /// </summary>
    /// <param name="language">Optional language filter.</param>
    /// <param name="page">Optional page/namespace filter.</param>
    /// <param name="pageNumber">Page number (default 1).</param>
    /// <param name="pageSize">Page size (default 50).</param>
    /// <param name="ct">Cancellation token.</param>
    /// <response code="200">Paginated translation rows with total count.</response>
    [HttpGet]
    [Authorize(Policy = "AdminOnly")]
    [ProducesResponseType(typeof(PagedTranslationsResult), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPaged(
        [FromQuery] string? language,
        [FromQuery] string? page,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 50,
        CancellationToken ct = default)
    {
        var result = await _translationService.GetPagedAsync(language, page, pageNumber, pageSize, ct);
        return Ok(result);
    }

    /// <summary>
    /// Upserts a single translation row identified by language, page and key.
    /// </summary>
    /// <param name="language">Language code.</param>
    /// <param name="page">Page/namespace identifier.</param>
    /// <param name="key">Translation key.</param>
    /// <param name="body">Object containing the value to set.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <response code="200">Full updated translation row.</response>
    [HttpPut("{language}/{page}/{key}")]
    [Authorize(Policy = "AdminOnly")]
    [ProducesResponseType(typeof(TranslationDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> Upsert(
        string language, string page, string key,
        [FromBody] UpsertTranslationRequest body,
        CancellationToken ct)
    {
        var result = await _translationService.UpsertAsync(language, page, key, body.Value, ct);
        return Ok(result);
    }

    /// <summary>
    /// Deletes a single translation row identified by language, page and key.
    /// </summary>
    /// <param name="language">Language code.</param>
    /// <param name="page">Page/namespace identifier.</param>
    /// <param name="key">Translation key.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <response code="204">Row deleted successfully.</response>
    /// <response code="404">Row not found.</response>
    [HttpDelete("{language}/{page}/{key}")]
    [Authorize(Policy = "AdminOnly")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(string language, string page, string key, CancellationToken ct)
    {
        var deleted = await _translationService.DeleteAsync(language, page, key, ct);
        if (!deleted) return NotFound();
        return NoContent();
    }
}

/// <summary>Request body for PUT /api/translations/{language}/{page}/{key}.</summary>
public class UpsertTranslationRequest
{
    /// <summary>The translated value to store.</summary>
    public string Value { get; set; } = string.Empty;
}
