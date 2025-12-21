using FleetTrack.Domain.Entities;
using System.Linq.Expressions;

namespace FleetTrack.Infrastructure.Repositories;

/// <summary>
/// Interface générique pour le pattern Repository
/// </summary>
/// <typeparam name="T">Type d'entité héritant de BaseEntity</typeparam>
public interface IRepository<T> where T : BaseEntity
{
    // Lecture
    Task<T?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IEnumerable<T>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> predicate, CancellationToken cancellationToken = default);
    Task<T?> FirstOrDefaultAsync(Expression<Func<T, bool>> predicate, CancellationToken cancellationToken = default);
    Task<bool> AnyAsync(Expression<Func<T, bool>> predicate, CancellationToken cancellationToken = default);
    Task<int> CountAsync(Expression<Func<T, bool>>? predicate = null, CancellationToken cancellationToken = default);

    // Écriture
    Task<T> AddAsync(T entity, CancellationToken cancellationToken = default);
    Task AddRangeAsync(IEnumerable<T> entities, CancellationToken cancellationToken = default);
    Task UpdateAsync(T entity, CancellationToken cancellationToken = default);
    Task DeleteAsync(T entity, CancellationToken cancellationToken = default); // Soft delete
    Task DeleteRangeAsync(IEnumerable<T> entities, CancellationToken cancellationToken = default);
    Task HardDeleteAsync(T entity, CancellationToken cancellationToken = default); // Hard delete

    // Inclusions et pagination
    Task<IEnumerable<T>> GetPagedAsync(int pageNumber, int pageSize, CancellationToken cancellationToken = default);
    IQueryable<T> Query();
}
