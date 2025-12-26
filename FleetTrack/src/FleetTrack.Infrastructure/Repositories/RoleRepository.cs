using FleetTrack.Application.Interfaces.Repositories;
using FleetTrack.Domain.Entities;
using FleetTrack.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FleetTrack.Infrastructure.Repositories;

/// <summary>
/// Implémentation du repository pour les rôles
/// </summary>
public class RoleRepository : Repository<Role>, IRoleRepository
{
    public RoleRepository(FleetTrackDbContext context) : base(context)
    {
    }

    public override async Task<Role?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _dbSet.FirstOrDefaultAsync(r => r.Id == id && !r.IsDeleted, cancellationToken);
    }

    public async Task<Role?> GetByNameAsync(string name, CancellationToken cancellationToken = default)
    {
        return await _dbSet.FirstOrDefaultAsync(r => r.Name == name && !r.IsDeleted, cancellationToken);
    }

    public async Task<IEnumerable<Role>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(r => !r.IsDeleted)
            .OrderBy(r => r.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Role>> GetAllWithUserCountAsync(CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(r => r.Users.Where(u => !u.IsDeleted))
            .Where(r => !r.IsDeleted)
            .OrderBy(r => r.Name)
            .ToListAsync(cancellationToken);
    }
}
