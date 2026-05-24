using System.Linq.Expressions;
using RepairFlow.API.Repositories.Interfaces;
using MongoDB.Driver;

namespace RepairFlow.API.Repositories.Base;

/// <summary>
/// Implementação genérica MongoDB — OCP (Open/Closed Principle).
/// Repositórios específicos estendem sem modificar este núcleo.
/// </summary>
public class MongoRepository<T> : IRepository<T> where T : class
{
    protected readonly IMongoCollection<T> _collection;

    public MongoRepository(IMongoDatabase database, string collectionName)
    {
        _collection = database.GetCollection<T>(collectionName);
    }

    public async Task<IEnumerable<T>> GetAllAsync()
        => await _collection.Find(_ => true).ToListAsync();

    public async Task<T?> GetByIdAsync(string id)
    {
        var filter = Builders<T>.Filter.Eq("_id", MongoDB.Bson.ObjectId.Parse(id));
        return await _collection.Find(filter).FirstOrDefaultAsync();
    }

    public async Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> filter)
        => await _collection.Find(filter).ToListAsync();

    public async Task<T> CreateAsync(T entity)
    {
        await _collection.InsertOneAsync(entity);
        return entity;
    }

    public async Task UpdateAsync(string id, T entity)
    {
        var filter = Builders<T>.Filter.Eq("_id", MongoDB.Bson.ObjectId.Parse(id));
        await _collection.ReplaceOneAsync(filter, entity);
    }

    public async Task DeleteAsync(string id)
    {
        var filter = Builders<T>.Filter.Eq("_id", MongoDB.Bson.ObjectId.Parse(id));
        await _collection.DeleteOneAsync(filter);
    }

    public async Task<bool> ExistsAsync(string id)
    {
        var filter = Builders<T>.Filter.Eq("_id", MongoDB.Bson.ObjectId.Parse(id));
        return await _collection.CountDocumentsAsync(filter) > 0;
    }

    public async Task<long> CountAsync()
        => await _collection.CountDocumentsAsync(_ => true);

    public async Task<long> CountAsync(Expression<Func<T, bool>> filter)
        => await _collection.CountDocumentsAsync(filter);
}