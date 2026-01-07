using FleetTrack.Application.DTOs.Alert;
using FleetTrack.Application.DTOs.Common;
using FleetTrack.Domain.Enums;

namespace FleetTrack.Application.Interfaces;

public interface IAlertService
{
    Task<PagedResult<AlertDto>> GetAllAsync(int pageNumber, int pageSize, Guid? vehicleId = null, AlertType? type = null, AlertSeverity? severity = null, bool? isAcknowledged = null, bool? isResolved = null, CancellationToken cancellationToken = default);
    Task<AlertDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IEnumerable<AlertDto>> GetByVehicleIdAsync(Guid vehicleId, CancellationToken cancellationToken = default);
    Task<IEnumerable<AlertDto>> GetUnacknowledgedAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<AlertDto>> GetUnresolvedAsync(CancellationToken cancellationToken = default);
    Task<int> GetUnacknowledgedCountAsync(CancellationToken cancellationToken = default);
    Task<AlertDto> CreateAsync(CreateAlertDto dto, CancellationToken cancellationToken = default);
    Task<AlertDto> AcknowledgeAsync(Guid id, AcknowledgeAlertDto dto, CancellationToken cancellationToken = default);
    Task<AlertDto> ResolveAsync(Guid id, ResolveAlertDto dto, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
