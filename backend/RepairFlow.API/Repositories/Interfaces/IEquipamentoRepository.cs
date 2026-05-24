using RepairFlow.API.Models;

namespace RepairFlow.API.Repositories.Interfaces;

public interface IEquipamentoRepository : IRepository<Equipamento>
{
    Task<IEnumerable<Equipamento>> GetByClienteIdAsync(string clienteId);
    Task<bool> NumeroSerieExisteAsync(string numeroSerie, string? ignorarId = null);
}