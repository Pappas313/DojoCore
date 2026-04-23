using DojoCore.Application.DTOs.Auth;
using DojoCore.Application.Exceptions;
using DojoCore.Application.Interfaces;
using DojoCore.Domain.Entities;
using DojoCore.Domain.Interfaces;

namespace DojoCore.Application.Services;

public class AuthService : IAuthService
{
    private readonly IUnitOfWork _uow;
    private readonly IFileStorageService _fileStorage;
    private readonly IGeocodingService _geocoding;
    private readonly IJwtService _jwt;

    public AuthService(IUnitOfWork uow, IFileStorageService fileStorage, IGeocodingService geocoding, IJwtService jwt)
    {
        _uow = uow;
        _fileStorage = fileStorage;
        _geocoding = geocoding;
        _jwt = jwt;
    }

    public async Task<RegisterResponseDto> RegisterAsync(
        RegisterRequestDto request,
        IReadOnlyList<(Stream Content, string FileName, string ContentType)> files,
        CancellationToken ct = default)
    {
        await ValidateAsync(request, ct);

        await _uow.BeginTransactionAsync(ct);
        try
        {
            // Resolve user lat/lon from address
            double? userLat = null, userLon = null;
            if (!string.IsNullOrWhiteSpace(request.User.Address))
            {
                var coords = await _geocoding.GeocodeAsync(request.User.Address, ct);
                if (coords.HasValue)
                {
                    userLat = coords.Value.Latitude;
                    userLon = coords.Value.Longitude;
                }
            }

            // 1. Create user
            var user = new User
            {
                Username = request.User.Username,
                Email = request.User.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.User.Password),
                UserCode = string.IsNullOrWhiteSpace(request.User.UserCode)
                    ? GenerateUserCode()
                    : request.User.UserCode,
                Role = request.User.Role,
                Address = request.User.Address,
                Gender = request.User.Gender,
                DateOfBirth = request.User.DateOfBirth,
                Latitude = userLat,
                Longitude = userLon,
                Status = 0
            };

            await _uow.Users.AddAsync(user, ct);

            // 2. Gym handling
            Guid? gymId = null;

            if (request.GymAction == "join")
            {
                var gym = await _uow.Gyms.GetByCodeAsync(request.GymCode!, ct);
                gymId = gym!.Id;

                var userGym = new UserGym
                {
                    UserId = user.Id,
                    GymId = gym.Id,
                    Role = user.Role,
                    Status = 0
                };
                await _uow.UserGyms.AddAsync(userGym, ct);
            }
            else if (request.GymAction == "create")
            {
                // Resolve gym lat/lon from gym address
                decimal? gymLat = null, gymLon = null;
                if (!string.IsNullOrWhiteSpace(request.NewGym!.Address))
                {
                    var coords = await _geocoding.GeocodeAsync(request.NewGym.Address, ct);
                    if (coords.HasValue)
                    {
                        gymLat = (decimal)coords.Value.Latitude;
                        gymLon = (decimal)coords.Value.Longitude;
                    }
                }

                var newGym = new Gym
                {
                    Name = request.NewGym.Name,
                    Address = request.NewGym.Address,
                    Latitude = gymLat,
                    Longitude = gymLon,
                    GymCode = GenerateGymCode(),
                    CreatedBy = user.Id,
                    Status = 0
                };
                await _uow.Gyms.AddAsync(newGym, ct);
                gymId = newGym.Id;

                var userGym = new UserGym
                {
                    UserId = user.Id,
                    GymId = newGym.Id,
                    Role = user.Role,
                    Status = 0
                };
                await _uow.UserGyms.AddAsync(userGym, ct);
            }

            // 3. Save documents
            if (files.Count > 0)
            {
                var documents = new List<Document>();
                foreach (var (content, fileName, contentType) in files)
                {
                    var storedPath = await _fileStorage.SaveAsync(content, fileName, ct);
                    documents.Add(new Document
                    {
                        UserId = user.Id,
                        GymId = gymId,
                        FileName = fileName,
                        FilePath = storedPath,
                        FileType = contentType,
                        Status = 0
                    });
                }
                await _uow.Documents.AddRangeAsync(documents, ct);
            }

            await _uow.CommitAsync(ct);

            return new RegisterResponseDto
            {
                User = new RegisteredUserDto
                {
                    Id = user.Id,
                    Username = user.Username,
                    Email = user.Email,
                    Role = user.Role,
                    Status = user.Status
                },
                Message = "Registration successful. Your account is pending administrator approval."
            };
        }
        catch
        {
            await _uow.RollbackAsync(ct);
            throw;
        }
    }

    private async Task ValidateAsync(RegisterRequestDto request, CancellationToken ct)
    {
        var errors = new Dictionary<string, string[]>();

        if (await _uow.Users.EmailExistsAsync(request.User.Email, ct))
            errors["email"] = ["Email is already in use."];

        if (await _uow.Users.UsernameExistsAsync(request.User.Username, ct))
            errors["username"] = ["Username is already in use."];

        if (request.GymAction == "join")
        {
            if (string.IsNullOrWhiteSpace(request.GymCode))
            {
                errors["gymCode"] = ["Gym code is required when joining a gym."];
            }
            else
            {
                var gymExists = await _uow.Gyms.GetByCodeAsync(request.GymCode, ct);
                if (gymExists is null)
                    errors["gymCode"] = [$"Gym code '{request.GymCode}' does not exist."];
            }
        }

        if (request.GymAction == "create" && request.NewGym is null)
            errors["newGym"] = ["Gym details are required when creating a gym."];

        if (errors.Count > 0)
            throw new ValidationException(errors);
    }

    public async Task<(LoginResponseDto Response, string Token)> LoginAsync(
        LoginRequestDto request,
        CancellationToken ct = default)
    {
        var user = await _uow.Users.GetByEmailOrUsernameAsync(request.Identifier, ct);

        if (user is null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            throw new UnauthorizedAccessException("InvalidCredentials");

        var token = _jwt.GenerateToken(user);

        var response = new LoginResponseDto
        {
            User = new LoginUserDto
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                Role = user.Role,
                Status = user.Status
            },
            Message = "Authentication successful."
        };

        return (response, token);
    }

    private static string GenerateUserCode() =>
        Guid.NewGuid().ToString("N")[..10].ToUpper();

    private static string GenerateGymCode() =>
        "GYM-" + Guid.NewGuid().ToString("N")[..5].ToUpper();
}
