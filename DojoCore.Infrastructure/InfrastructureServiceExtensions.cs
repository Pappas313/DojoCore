using Dapper;
using DojoCore.Application.Interfaces;
using DojoCore.Application.Services;
using DojoCore.Domain.Interfaces;
using DojoCore.Infrastructure.Persistence;
using DojoCore.Infrastructure.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Npgsql;

namespace DojoCore.Infrastructure;

public static class InfrastructureServiceExtensions
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        SqlMapper.AddTypeHandler(new DateOnlyTypeHandler());
        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Connection string 'DefaultConnection' is not configured.");

        services.AddScoped<NpgsqlConnection>(_ => new NpgsqlConnection(connectionString));
        services.AddScoped<IUnitOfWork, UnitOfWork>();

        var uploadsPath = configuration["FileStorage:BasePath"]
            ?? Path.Combine(Directory.GetCurrentDirectory(), "uploads");
        services.AddSingleton<IFileStorageService>(_ => new LocalFileStorageService(uploadsPath));

        services.AddHttpClient<IGeocodingService, NominatimGeocodingService>(client =>
        {
            client.DefaultRequestHeaders.UserAgent.ParseAdd("DojoCore/1.0 (contact@dojo.com)");
            client.Timeout = TimeSpan.FromSeconds(5);
        });

        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IJwtService, JwtService>();
        services.AddScoped<IMenuService, MenuService>();
        services.AddScoped<IAthleteService, AthleteService>();
        services.AddScoped<IManagerService, ManagerService>();
        services.AddScoped<ICoachService, CoachService>();
        services.AddScoped<IGymService, GymService>();

        return services;
    }
}
