using MongoDB.Driver;
using RepairFlow.API.Models;
using RepairFlow.API.Repositories.Base;
using RepairFlow.API.Repositories.Interfaces;

namespace RepairFlow.API.Repositories.Implementations;

public class EquipamentoRepository : MongoRepository<Equipamento>, IEquipamentoRepository
{
    public EquipamentoRepository(IMongoDatabase database)
        : base(database, "equipamentos") { }

    public async Task<IEnumerable<Equipamento>> GetByClienteIdAsync(string clienteId)
        => await _collection.Find(e => e.ClienteId == clienteId).ToListAsync();

    public async Task<bool> NumeroSerieExisteAsync(string numeroSerie, string? ignorarId = null)
    {
        var filter = ignorarId is null
            ? Builders<Equipamento>.Filter.Eq(e => e.NumeroSerie, numeroSerie)
            : Builders<Equipamento>.Filter.And(
                Builders<Equipamento>.Filter.Eq(e => e.NumeroSerie, numeroSerie),
                Builders<Equipamento>.Filter.Ne(e => e.Id, ignorarId));

        return await _collection.CountDocumentsAsync(filter) > 0;
    }
}