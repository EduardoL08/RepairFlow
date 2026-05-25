using RepairFlow.API.Repositories.Implementations;
using RepairFlow.API.Repositories.Interfaces;

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

}
