using FleetTrack.Domain.Entities;
using FleetTrack.Domain.Enums;

namespace FleetTrack.Application.Interfaces.Repositories;

public interface IVehicleRepository
{
    Task<Vehicle?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IEnumerable<Vehicle>> GetPagedAsync(int pageNumber, int pageSize, CancellationToken cancellationToken = default);
    Task<int> CountAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<Vehicle>> GetAvailableVehiclesAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<Vehicle>> GetVehiclesByStatusAsync(VehicleStatus status, CancellationToken cancellationToken = default);
    Task<IEnumerable<Vehicle>> GetVehiclesByTypeAsync(VehicleType type, CancellationToken cancellationToken = default);
    Task<Vehicle?> GetByRegistrationNumberAsync(string registrationNumber, CancellationToken cancellationToken = default);
    Task<IEnumerable<Vehicle>> GetVehiclesNeedingMaintenanceAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<Vehicle>> GetVehiclesWithLowFuelAsync(double threshold, CancellationToken cancellationToken = default);
    Task<Vehicle?> GetVehicleWithDetailsAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Vehicle> AddAsync(Vehicle vehicle, CancellationToken cancellationToken = default);
    Task UpdateAsync(Vehicle vehicle, CancellationToken cancellationToken = default);
    Task DeleteAsync(Vehicle vehicle, CancellationToken cancellationToken = default);
}
