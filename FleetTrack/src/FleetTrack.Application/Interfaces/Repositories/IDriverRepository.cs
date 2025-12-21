using FleetTrack.Domain.Entities;
using FleetTrack.Domain.Enums;

namespace FleetTrack.Application.Interfaces.Repositories;

public interface IDriverRepository
{
    Task<Driver?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IEnumerable<Driver>> GetPagedAsync(int pageNumber, int pageSize, CancellationToken cancellationToken = default);
    Task<int> CountAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<Driver>> GetAvailableDriversAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<Driver>> GetDriversByStatusAsync(DriverStatus status, CancellationToken cancellationToken = default);
    Task<Driver?> GetByEmailAsync(string email, CancellationToken cancellationToken = default);
    Task<Driver?> GetByLicenseNumberAsync(string licenseNumber, CancellationToken cancellationToken = default);
    Task<IEnumerable<Driver>> GetDriversWithExpiredLicensesAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<Driver>> GetDriversWithExpiringSoonLicensesAsync(int daysThreshold, CancellationToken cancellationToken = default);
    Task<Driver?> GetDriverWithDetailsAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Driver> AddAsync(Driver driver, CancellationToken cancellationToken = default);
    Task UpdateAsync(Driver driver, CancellationToken cancellationToken = default);
    Task DeleteAsync(Driver driver, CancellationToken cancellationToken = default);
}
