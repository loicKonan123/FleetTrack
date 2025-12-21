using FleetTrack.Application.Interfaces.Repositories;
using FleetTrack.Domain.Entities;
using FleetTrack.Domain.Enums;
using FleetTrack.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FleetTrack.Infrastructure.Repositories;

/// <summary>
/// Implémentation du repository pour les conducteurs
/// </summary>
public class DriverRepository : Repository<Driver>, IDriverRepository
{
    public DriverRepository(FleetTrackDbContext context) : base(context)
    {
    }

    public async Task<int> CountAsync(CancellationToken cancellationToken = default)
    {
        return await base.CountAsync(null, cancellationToken);
    }

    public async Task<IEnumerable<Driver>> GetAvailableDriversAsync(CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(d => d.Status == DriverStatus.Available)
            .OrderBy(d => d.LastName)
            .ThenBy(d => d.FirstName)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Driver>> GetDriversByStatusAsync(DriverStatus status, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(d => d.Status == status)
            .OrderBy(d => d.LastName)
            .ThenBy(d => d.FirstName)
            .ToListAsync(cancellationToken);
    }

    public async Task<Driver?> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .FirstOrDefaultAsync(d => d.Email == email, cancellationToken);
    }

    public async Task<Driver?> GetByLicenseNumberAsync(string licenseNumber, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .FirstOrDefaultAsync(d => d.LicenseNumber == licenseNumber, cancellationToken);
    }

    public async Task<IEnumerable<Driver>> GetDriversWithExpiredLicensesAsync(CancellationToken cancellationToken = default)
    {
        var today = DateTime.UtcNow.Date;

        return await _dbSet
            .Where(d => d.LicenseExpiryDate < today)
            .OrderBy(d => d.LicenseExpiryDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Driver>> GetDriversWithExpiringSoonLicensesAsync(int daysThreshold, CancellationToken cancellationToken = default)
    {
        var today = DateTime.UtcNow.Date;
        var threshold = today.AddDays(daysThreshold);

        return await _dbSet
            .Where(d => d.LicenseExpiryDate >= today && d.LicenseExpiryDate <= threshold)
            .OrderBy(d => d.LicenseExpiryDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<Driver?> GetDriverWithDetailsAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(d => d.CurrentVehicle)
            .Include(d => d.Missions.Where(m => m.Status == MissionStatus.InProgress || m.Status == MissionStatus.Assigned))
            .FirstOrDefaultAsync(d => d.Id == id, cancellationToken);
    }
}
