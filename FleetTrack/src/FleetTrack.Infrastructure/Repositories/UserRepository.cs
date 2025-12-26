using FleetTrack.Application.Interfaces.Repositories;
using FleetTrack.Domain.Entities;
using FleetTrack.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FleetTrack.Infrastructure.Repositories;

/// <summary>
/// Implémentation du repository pour les utilisateurs
/// </summary>
public class UserRepository : Repository<User>, IUserRepository
{
    public UserRepository(FleetTrackDbContext context) : base(context)
    {
    }

    public override async Task<User?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Id == id && !u.IsDeleted, cancellationToken);
    }

    public async Task<User?> GetByIdWithDetailsAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(u => u.Role)
            .Include(u => u.Driver)
            .FirstOrDefaultAsync(u => u.Id == id && !u.IsDeleted, cancellationToken);
    }

    public async Task<User?> GetByUsernameAsync(string username, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Username == username && !u.IsDeleted, cancellationToken);
    }

    public async Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Email == email && !u.IsDeleted, cancellationToken);
    }

    public async Task<IEnumerable<User>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(u => u.Role)
            .Where(u => !u.IsDeleted)
            .OrderBy(u => u.LastName)
            .ThenBy(u => u.FirstName)
            .ToListAsync(cancellationToken);
    }

    public override async Task<IEnumerable<User>> GetPagedAsync(int pageNumber, int pageSize, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(u => u.Role)
            .Where(u => !u.IsDeleted)
            .OrderBy(u => u.LastName)
            .ThenBy(u => u.FirstName)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<User>> GetByRoleAsync(Guid roleId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(u => u.Role)
            .Where(u => u.RoleId == roleId && !u.IsDeleted)
            .OrderBy(u => u.LastName)
            .ThenBy(u => u.FirstName)
            .ToListAsync(cancellationToken);
    }

    public async Task<int> CountAsync(CancellationToken cancellationToken = default)
    {
        return await _dbSet.CountAsync(u => !u.IsDeleted, cancellationToken);
    }

    public async Task<bool> ExistsAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _dbSet.AnyAsync(u => u.Id == id && !u.IsDeleted, cancellationToken);
    }

    public async Task<bool> UsernameExistsAsync(string username, CancellationToken cancellationToken = default)
    {
        return await _dbSet.AnyAsync(u => u.Username == username && !u.IsDeleted, cancellationToken);
    }

    public async Task<bool> EmailExistsAsync(string email, CancellationToken cancellationToken = default)
    {
        return await _dbSet.AnyAsync(u => u.Email == email && !u.IsDeleted, cancellationToken);
    }
}
