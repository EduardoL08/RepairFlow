using MongoDB.Driver;
using RepairFlow.API.Models;
using RepairFlow.API.Repositories.Base;
using RepairFlow.API.Repositories.Interfaces;

namespace RepairFlow.API.Repositories.Implementations;

public class ClienteRepository : MongoRepository<Cliente>, IClienteRepository
{
    public ClienteRepository(IMongoDatabase database)
        : base(database, "clientes") { }

    public async Task<Cliente?> GetByCpfAsync(string cpf)
        => await _collection.Find(c => c.Cpf == cpf).FirstOrDefaultAsync();

    public async Task<Cliente?> GetByEmailAsync(string email)
        => await _collection.Find(c => c.Email == email).FirstOrDefaultAsync();

    public async Task<bool> CpfExisteAsync(string cpf, string? ignorarId = null)
    {
        var filter = ignorarId is null
            ? Builders<Cliente>.Filter.Eq(c => c.Cpf, cpf)
            : Builders<Cliente>.Filter.And(
                Builders<Cliente>.Filter.Eq(c => c.Cpf, cpf),
                Builders<Cliente>.Filter.Ne(c => c.Id, ignorarId));

        return await _collection.CountDocumentsAsync(filter) > 0;
    }

    public async Task<bool> EmailExisteAsync(string email, string? ignorarId = null)
    {
        var filter = ignorarId is null
            ? Builders<Cliente>.Filter.Eq(c => c.Email, email)
            : Builders<Cliente>.Filter.And(
                Builders<Cliente>.Filter.Eq(c => c.Email, email),
                Builders<Cliente>.Filter.Ne(c => c.Id, ignorarId));

        return await _collection.CountDocumentsAsync(filter) > 0;
    }
}