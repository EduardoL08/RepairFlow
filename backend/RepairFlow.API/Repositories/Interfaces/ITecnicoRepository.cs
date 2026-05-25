using RepairFlow.API.Models;

namespace RepairFlow.API.Repositories.Interfaces;

public interface ITecnicoRepository : IRepository<Tecnico>
{
    Task<Tecnico?> GetByEmailAsync(string email);
    Task<bool> EmailExisteAsync(string email, string? ignorarId = null);
}
