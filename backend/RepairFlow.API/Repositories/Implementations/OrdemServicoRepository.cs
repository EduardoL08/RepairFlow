using MongoDB.Driver;
using RepairFlow.API.Models;
using RepairFlow.API.Repositories.Base;
using RepairFlow.API.Repositories.Interfaces;

namespace RepairFlow.API.Repositories.Implementations;

public class OrdemServicoRepository : MongoRepository<OrdemServico>, IOrdemServicoRepository
{
    public OrdemServicoRepository(IMongoDatabase database)
        : base(database, "ordensServico") { }

    public async Task<IEnumerable<OrdemServico>> GetByStatusAsync(StatusOrdem status)
        => await _collection.Find(o => o.Status == status).ToListAsync();

    public async Task<IEnumerable<OrdemServico>> GetByTecnicoIdAsync(string tecnicoId)
        => await _collection.Find(o => o.TecnicoId == tecnicoId).ToListAsync();

    public async Task<IEnumerable<OrdemServico>> GetByEquipamentoIdAsync(string equipamentoId)
        => await _collection.Find(o => o.EquipamentoId == equipamentoId).ToListAsync();

    public async Task<Dictionary<string, long>> GetContagemPorStatusAsync()
    {
        var resultado = new Dictionary<string, long>();
        foreach (StatusOrdem status in Enum.GetValues<StatusOrdem>())
        {
            var count = await _collection.CountDocumentsAsync(o => o.Status == status);
            resultado[status.ToString()] = count;
        }
        return resultado;
    }
}
