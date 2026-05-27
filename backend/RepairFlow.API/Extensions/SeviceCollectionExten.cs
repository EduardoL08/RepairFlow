using System.Text;
using FluentValidation;
using FluentValidation.AspNetCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using RepairFlow.API.Configurations;
using RepairFlow.API.Repositories.Implementations;
using RepairFlow.API.Repositories.Interfaces;
using RepairFlow.API.Services.Implementations;
using RepairFlow.API.Services.Interfaces;
using RepairFlow.API.Validators;

namespace RepairFlow.API.Extensions;

/// <summary>
/// Extensões de DI — SRP: cada método registra um grupo coeso de dependências,
/// mantendo o Program.cs enxuto e legível.
/// </summary>
public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddRepositories(this IServiceCollection services)
    {
        services.AddScoped<IClienteRepository, ClienteRepository>();
        services.AddScoped<IEquipamentoRepository, EquipamentoRepository>();
        services.AddScoped<IOrdemServicoRepository, OrdemServicoRepository>();
        services.AddScoped<ITecnicoRepository, TecnicoRepository>();
        services.AddScoped<IUsuarioRepository, UsuarioRepository>();
        return services;
    }

     public static IServiceCollection AddServices(this IServiceCollection services)
    {
        services.AddScoped<IClienteService, ClienteService>();
        services.AddScoped<IEquipamentoService, EquipamentoService>();
        services.AddScoped<ITecnicoService, TecnicoService>();
        services.AddScoped<IOrdemServicoService, OrdemServicoService>();
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<TokenService>();
        return services;
    }

    public static IServiceCollection AddValidators(this IServiceCollection services)
    {
        services.AddValidatorsFromAssemblyContaining<ClienteValidator>();
        services.AddFluentValidationAutoValidation();
        return services;
    }

     public static IServiceCollection AddJwtAuthentication(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var jwtSettings = configuration.GetSection("JwtSettings").Get<JwtSettings>()!;

        services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(options =>
        {
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer = jwtSettings.Issuer,
                ValidAudience = jwtSettings.Audience,
                IssuerSigningKey = new SymmetricSecurityKey(
                    Encoding.UTF8.GetBytes(jwtSettings.SecretKey)),
                ClockSkew = TimeSpan.Zero
            };
        });
        
        services.AddAuthorization();
        return services;
    }

}
