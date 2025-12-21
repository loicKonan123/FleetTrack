using FleetTrack.Application.Interfaces.Repositories;
using FleetTrack.Domain.Entities;
using FleetTrack.Domain.Enums;
using FleetTrack.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FleetTrack.Infrastructure.Repositories;

/// <summary>
/// Implémentation du repository pour les véhicules
/// </summary>
public class VehicleRepository : Repository<Vehicle>, IVehicleRepository
{
    public VehicleRepository(FleetTrackDbContext context) : base(context)
    {
    }

    public async Task<int> CountAsync(CancellationToken cancellationToken = default)
    {
        return await base.CountAsync(null, cancellationToken);
    }

    public async Task<IEnumerable<Vehicle>> GetAvailableVehiclesAsync(CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(v => v.Status == VehicleStatus.Available)
            .OrderBy(v => v.RegistrationNumber)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Vehicle>> GetVehiclesByStatusAsync(VehicleStatus status, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(v => v.Status == status)
            .OrderBy(v => v.RegistrationNumber)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Vehicle>> GetVehiclesByTypeAsync(VehicleType type, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(v => v.Type == type)
            .OrderBy(v => v.RegistrationNumber)
            .ToListAsync(cancellationToken);
    }

    public async Task<Vehicle?> GetByRegistrationNumberAsync(string registrationNumber, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .FirstOrDefaultAsync(v => v.RegistrationNumber == registrationNumber, cancellationToken);
    }

    public async Task<IEnumerable<Vehicle>> GetVehiclesNeedingMaintenanceAsync(CancellationToken cancellationToken = default)
    {
        var today = DateTime.UtcNow.Date;

        return await _dbSet
            .Where(v => v.NextMaintenanceDate.HasValue && v.NextMaintenanceDate.Value <= today.AddDays(7))
            .OrderBy(v => v.NextMaintenanceDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Vehicle>> GetVehiclesWithLowFuelAsync(double threshold, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(v => v.CurrentFuelLevel <= threshold)
            .OrderBy(v => v.CurrentFuelLevel)
            .ToListAsync(cancellationToken);
    }

    public async Task<Vehicle?> GetVehicleWithDetailsAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(v => v.CurrentDriver)
            .Include(v => v.Missions.Where(m => m.Status == MissionStatus.InProgress || m.Status == MissionStatus.Assigned))
            .Include(v => v.Alerts.Where(a => !a.IsResolved))
            .FirstOrDefaultAsync(v => v.Id == id, cancellationToken);
    }
}
