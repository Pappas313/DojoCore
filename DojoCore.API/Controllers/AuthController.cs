using DojoCore.API.Models;
using DojoCore.Application.DTOs.Auth;
using DojoCore.Application.Exceptions;
using DojoCore.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

namespace DojoCore.API.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private static readonly JsonSerializerOptions _jsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
        Converters = { new System.Text.Json.Serialization.JsonStringEnumConverter() }
    };

    private readonly IAuthService _authService;
    private readonly ILogger<AuthController> _logger;
    private readonly IWebHostEnvironment _env;

    public AuthController(IAuthService authService, ILogger<AuthController> logger, IWebHostEnvironment env)
    {
        _authService = authService;
        _logger = logger;
        _env = env;
    }

    /// <summary>Authenticates a user using their email/username and password. Returns user info and sets an HttpOnly access token cookie.</summary>
    [HttpPost("login")]
    [Consumes("multipart/form-data", "application/json")]
    [ProducesResponseType(typeof(LoginResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login(CancellationToken ct)
    {
        LoginRequestDto request;

        if (Request.HasJsonContentType())
        {
            request = await Request.ReadFromJsonAsync<LoginRequestDto>(_jsonOptions, ct)
                ?? new LoginRequestDto();
        }
        else
        {
            request = new LoginRequestDto
            {
                Identifier = Request.Form["identifier"].ToString(),
                Password   = Request.Form["password"].ToString()
            };
        }

        if (string.IsNullOrWhiteSpace(request.Identifier) || string.IsNullOrWhiteSpace(request.Password))
        {
            return Unauthorized(new
            {
                error   = "InvalidCredentials",
                message = "Invalid username/email or password."
            });
        }

        try
        {
            var (response, token) = await _authService.LoginAsync(request, ct);

            Response.Cookies.Append("accessToken", token, new CookieOptions
            {
                HttpOnly = true,
                Secure   = true,
                SameSite = SameSiteMode.Strict,
                Expires  = DateTimeOffset.UtcNow.AddHours(1)
            });

            return Ok(response);
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized(new
            {
                error   = "InvalidCredentials",
                message = "Invalid username/email or password."
            });
        }
    }

    /// <summary>Registers a new user. Accepts multipart/form-data with a 'payload' JSON field and optional 'files'.</summary>
    [HttpPost("register")]
    [Consumes("multipart/form-data")]
    [RequestSizeLimit(100 * 1024 * 1024)]           // 100 MB
    [RequestFormLimits(MultipartBodyLengthLimit = 100 * 1024 * 1024)]
    [ProducesResponseType(typeof(RegisterResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> Register([FromForm] RegisterFormRequest form, CancellationToken ct)
    {
        RegisterRequestDto request;

        // Support both: stringified JSON in "payload" field (API clients)
        // OR flat individual fields sent by Swagger UI
        if (!string.IsNullOrWhiteSpace(form.Payload))
        {
            try
            {
                request = JsonSerializer.Deserialize<RegisterRequestDto>(form.Payload, _jsonOptions)
                    ?? throw new InvalidOperationException();
            }
            catch
            {
                return BadRequest(new { error = "ValidationError", message = "Invalid JSON in 'payload' field." });
            }
        }
        else
        {
            request = BuildFromFlatForm(Request.Form);
        }

        IEnumerable<IFormFile> formFiles = form.Files is { Count: > 0 } f ? f : [];
        var files = formFiles
            .Select(f => (f.OpenReadStream(), f.FileName, f.ContentType))
            .ToList()
            .AsReadOnly();

        try
        {
            var result = await _authService.RegisterAsync(request, files, ct);
            return StatusCode(StatusCodes.Status201Created, result);
        }
        catch (ValidationException ex)
        {
            return BadRequest(new
            {
                error = "ValidationError",
                message = "Invalid registration data.",
                details = ex.Details
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Registration failed");
            var message = _env.IsDevelopment()
                ? ex.ToString()
                : "An error occurred while saving documents. Registration rolled back.";
            return StatusCode(StatusCodes.Status500InternalServerError, new
            {
                error = "TransactionFailed",
                message
            });
        }
    }

    private static RegisterRequestDto BuildFromFlatForm(IFormCollection form)
    {
        short.TryParse(form["user[role]"], out var role);
        short.TryParse(form["user[gender]"], out var gender);
        DateOnly.TryParse(form["user[dateOfBirth]"], out var dob);

        var hasNewGym = !string.IsNullOrWhiteSpace(form["newGym[name]"]);

        return new RegisterRequestDto
        {
            User = new RegisterUserDto
            {
                Username = form["user[username]"].ToString(),
                Email = form["user[email]"].ToString(),
                Password = form["user[password]"].ToString(),
                UserCode = form["user[user_code]"].ToString().NullIfEmpty(),
                Role = role,
                Address = form["user[address]"].ToString().NullIfEmpty(),
                Gender = string.IsNullOrEmpty(form["user[gender]"]) ? null : gender,
                DateOfBirth = string.IsNullOrEmpty(form["user[dateOfBirth]"]) ? null : dob
            },
            GymAction = form["gymAction"].ToString() is { Length: > 0 } ga ? ga : "none",
            GymCode = form["gymCode"].ToString().NullIfEmpty(),
            NewGym = hasNewGym ? new NewGymDto
            {
                Name = form["newGym[name]"].ToString(),
                Address = form["newGym[address]"].ToString()
            } : null
        };
    }
}

internal static class StringExtensions
{
    public static string? NullIfEmpty(this string value) =>
        string.IsNullOrWhiteSpace(value) ? null : value;
}
