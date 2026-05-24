using System.Linq.Expressions;

namespace RepairFlow.API.Repositories.Interfaces;

/// <summary>
/// Abstração genérica de repositório — DIP (Dependency Inversion Principle).
/// Toda dependência de persistência aponta para esta interface, nunca para MongoDB diretamente.
/// </summary>
public interface IRepository<T> where T : class
{
    Task<IEnumerable<T>> GetAllAsync();
    Task<T?> GetByIdAsync(string id);
    Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> filter);
    Task<T> CreateAsync(T entity);
    Task UpdateAsync(string id, T entity);
    Task DeleteAsync(string id);
    Task<bool> ExistsAsync(string id);
    Task<long> CountAsync();
    Task<long> CountAsync(Expression<Func<T, bool>> filter);
}