using MongoDB.Driver;
using RepairFlow.API.Models;
using RepairFlow.API.Repositories.Base;
using RepairFlow.API.Repositories.Interfaces;

namespace RepairFlow.API.Repositories.Implementations;

public class TecnicoRepository : MongoRepository<Tecnico>, ITecnicoRepository
{
    public TecnicoRepository(IMongoDatabase database)
        : base(database, "tecnicos") { }

    public async Task<Tecnico?> GetByEmailAsync(string email)
        => await _collection.Find(t => t.Email == email).FirstOrDefaultAsync();

    public async Task<bool> EmailExisteAsync(string email, string? ignorarId = null)
    {
        var filter = ignorarId is null
            ? Builders<Tecnico>.Filter.Eq(t => t.Email, email)
            : Builders<Tecnico>.Filter.And(
                Builders<Tecnico>.Filter.Eq(t => t.Email, email),
                Builders<Tecnico>.Filter.Ne(t => t.Id, ignorarId));

        return await _collection.CountDocumentsAsync(filter) > 0;
    }
}
