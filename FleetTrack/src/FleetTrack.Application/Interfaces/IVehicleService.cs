using FleetTrack.Application.DTOs.Common;
using FleetTrack.Application.DTOs.Vehicle;
using FleetTrack.Domain.Enums;

namespace FleetTrack.Application.Interfaces;

public interface IVehicleService
{
    Task<PagedResult<VehicleDto>> GetAllAsync(int pageNumber, int pageSize, CancellationToken cancellationToken = default);
    Task<VehicleDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<VehicleDetailsDto?> GetDetailsAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IEnumerable<VehicleDto>> GetAvailableAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<VehicleDto>> GetByStatusAsync(VehicleStatus status, CancellationToken cancellationToken = default);
    Task<VehicleDto> CreateAsync(CreateVehicleDto dto, CancellationToken cancellationToken = default);
    Task<VehicleDto> UpdateAsync(Guid id, UpdateVehicleDto dto, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
