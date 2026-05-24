using RepairFlow.API.Models;

namespace RepairFlow.API.Repositories.Interfaces;

public interface IClienteRepository : IRepository<Cliente>
{
    Task<bool> CpfExisteAsync(string cpf, string? ignorarId = null);
    Task<bool> EmailExisteAsync(string email, string? ignorarId = null);
    Task<Cliente?> GetByCpfAsync(string cpf);
    Task<Cliente?> GetByEmailAsync(string email);
}