using FleetTrack.Application.Interfaces.Repositories;
using FleetTrack.Domain.Entities;
using FleetTrack.Domain.Enums;
using FleetTrack.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FleetTrack.Infrastructure.Repositories;

/// <summary>
/// Implémentation du repository pour les missions
/// </summary>
public class MissionRepository : Repository<Mission>, IMissionRepository
{
    public MissionRepository(FleetTrackDbContext context) : base(context)
    {
    }

    public override async Task<Mission?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(m => m.Vehicle)
            .Include(m => m.Driver)
            .FirstOrDefaultAsync(m => m.Id == id, cancellationToken);
    }

    public override async Task<IEnumerable<Mission>> GetPagedAsync(int pageNumber, int pageSize, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(m => m.Vehicle)
            .Include(m => m.Driver)
            .OrderByDescending(m => m.StartDate)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);
    }

    public async Task<int> CountAsync(CancellationToken cancellationToken = default)
    {
        return await base.CountAsync(null, cancellationToken);
    }

    public async Task<IEnumerable<Mission>> GetPagedWithFiltersAsync(int pageNumber, int pageSize, MissionStatus? status = null, MissionPriority? priority = null, CancellationToken cancellationToken = default)
    {
        var query = _dbSet
            .Include(m => m.Vehicle)
            .Include(m => m.Driver)
            .AsQueryable();

        if (status.HasValue)
        {
            query = query.Where(m => m.Status == status.Value);
        }

        if (priority.HasValue)
        {
            query = query.Where(m => m.Priority == priority.Value);
        }

        return await query
            .OrderByDescending(m => m.StartDate)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);
    }

    public async Task<int> CountWithFiltersAsync(MissionStatus? status = null, MissionPriority? priority = null, CancellationToken cancellationToken = default)
    {
        var query = _dbSet.AsQueryable();

        if (status.HasValue)
        {
            query = query.Where(m => m.Status == status.Value);
        }

        if (priority.HasValue)
        {
            query = query.Where(m => m.Priority == priority.Value);
        }

        return await query.CountAsync(cancellationToken);
    }

    public async Task<IEnumerable<Mission>> GetMissionsByStatusAsync(MissionStatus status, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(m => m.Status == status)
            .OrderByDescending(m => m.Priority)
            .ThenBy(m => m.StartDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Mission>> GetMissionsByVehicleIdAsync(Guid vehicleId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(m => m.VehicleId == vehicleId)
            .OrderByDescending(m => m.StartDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Mission>> GetMissionsByDriverIdAsync(Guid driverId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(m => m.DriverId == driverId)
            .OrderByDescending(m => m.StartDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Mission>> GetActiveMissionsAsync(CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(m => m.Status == MissionStatus.InProgress || m.Status == MissionStatus.Assigned)
            .Include(m => m.Vehicle)
            .Include(m => m.Driver)
            .Include(m => m.Waypoints)
            .OrderByDescending(m => m.Priority)
            .ThenBy(m => m.StartDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Mission>> GetMissionsByPriorityAsync(MissionPriority priority, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(m => m.Priority == priority)
            .OrderBy(m => m.StartDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Mission>> GetMissionsForDateRangeAsync(DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(m => m.StartDate >= startDate && m.StartDate <= endDate)
            .OrderBy(m => m.StartDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<Mission?> GetMissionWithDetailsAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(m => m.Vehicle)
            .Include(m => m.Driver)
            .Include(m => m.Waypoints.OrderBy(w => w.Order))
            .FirstOrDefaultAsync(m => m.Id == id, cancellationToken);
    }

    public async Task<IEnumerable<Mission>> GetOverdueMissionsAsync(CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;

        return await _dbSet
            .Where(m => (m.Status == MissionStatus.InProgress || m.Status == MissionStatus.Assigned)
                     && m.EndDate.HasValue
                     && m.EndDate.Value < now)
            .OrderBy(m => m.EndDate)
            .ToListAsync(cancellationToken);
    }
}
