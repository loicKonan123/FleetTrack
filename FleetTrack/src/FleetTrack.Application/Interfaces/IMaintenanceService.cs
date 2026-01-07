using FleetTrack.Application.DTOs.Common;
using FleetTrack.Application.DTOs.Maintenance;
using FleetTrack.Domain.Enums;

namespace FleetTrack.Application.Interfaces;

public interface IMaintenanceService
{
    Task<PagedResult<MaintenanceDto>> GetAllAsync(int pageNumber, int pageSize, Guid? vehicleId = null, MaintenanceType? type = null, bool? isCompleted = null, CancellationToken cancellationToken = default);
    Task<MaintenanceDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IEnumerable<MaintenanceDto>> GetByVehicleIdAsync(Guid vehicleId, CancellationToken cancellationToken = default);
    Task<IEnumerable<MaintenanceDto>> GetUpcomingAsync(int days = 30, CancellationToken cancellationToken = default);
    Task<IEnumerable<MaintenanceDto>> GetOverdueAsync(CancellationToken cancellationToken = default);
    Task<MaintenanceDto> CreateAsync(CreateMaintenanceDto dto, CancellationToken cancellationToken = default);
    Task<MaintenanceDto> UpdateAsync(Guid id, UpdateMaintenanceDto dto, CancellationToken cancellationToken = default);
    Task<MaintenanceDto> CompleteAsync(Guid id, CompleteMaintenanceDto dto, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
