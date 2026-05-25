using RepairFlow.API.Models;
using RepairFlow.API.Repositories.Interfaces;

namespace RepairFlow.API.Repositories.Interfaces;

public interface IUsuarioRepository : IRepository<Usuario>
{
    Task<bool> EmailExisteAsync(string email);
    Task<Usuario?> GetByEmailAsync(string email);
}