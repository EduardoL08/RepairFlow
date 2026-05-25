using MongoDB.Driver;
using RepairFlow.API.Models;
using RepairFlow.API.Repositories.Base;
using RepairFlow.API.Repositories.Interfaces;

namespace RepairFlow.API.Repositories.Implementations;

public class UsuarioRepository : MongoRepository<Usuario>, IUsuarioRepository
{
    public UsuarioRepository(IMongoDatabase database)
        : base(database, "usuarios") { }

    public async Task<Usuario?> GetByEmailAsync(string email)
        => await _collection.Find(u => u.Email == email).FirstOrDefaultAsync();

    public async Task<bool> EmailExisteAsync(string email)
        => await _collection.CountDocumentsAsync(u => u.Email == email) > 0;
}
