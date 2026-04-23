using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using DojoCore.Application.Interfaces;
using DojoCore.Domain.Entities;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace DojoCore.Infrastructure.Services;

public class JwtService : IJwtService
{
    private readonly string _secret;
    private readonly string _issuer;
    private readonly string _audience;
    private readonly int _expiryMinutes;

    public JwtService(IConfiguration configuration)
    {
        var section = configuration.GetSection("Jwt");
        _secret = section["Secret"] ?? throw new InvalidOperationException("Jwt:Secret is not configured.");
        _issuer = section["Issuer"] ?? "DojoCore";
        _audience = section["Audience"] ?? "DojoCore";
        _expiryMinutes = int.TryParse(section["ExpiryMinutes"], out var m) ? m : 60;
    }

    public string GenerateToken(User user)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_secret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim("username", user.Username),
            new Claim("role", user.Role.ToString()),
            new Claim("status", user.Status.ToString()),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var token = new JwtSecurityToken(
            issuer: _issuer,
            audience: _audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(_expiryMinutes),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
