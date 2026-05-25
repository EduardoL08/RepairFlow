using RepairFlow.API.Models;

namespace RepairFlow.API.Repositories.Interfaces;

public interface IOrdemServicoRepository : IRepository<OrdemServico>
{
    Task<IEnumerable<OrdemServico>> GetByStatusAsync(StatusOrdem status);
    Task<IEnumerable<OrdemServico>> GetByTecnicoIdAsync(string tecnicoId);
    Task<IEnumerable<OrdemServico>> GetByEquipamentoIdAsync(string equipamentoId);
    Task<Dictionary<string, long>> GetContagemPorStatusAsync();
}
