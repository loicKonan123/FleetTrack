using FleetTrack.Application.DTOs.Common;
using FleetTrack.Application.DTOs.Mission;
using FleetTrack.Domain.Enums;

namespace FleetTrack.Application.Interfaces;

public interface IMissionService
{
    Task<PagedResult<MissionDto>> GetAllAsync(int pageNumber, int pageSize, MissionStatus? status = null, MissionPriority? priority = null, CancellationToken cancellationToken = default);
    Task<MissionDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<MissionDetailsDto?> GetDetailsAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IEnumerable<MissionDto>> GetActiveAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<MissionDto>> GetByStatusAsync(MissionStatus status, CancellationToken cancellationToken = default);
    Task<MissionDto> CreateAsync(CreateMissionDto dto, CancellationToken cancellationToken = default);
    Task<MissionDto> UpdateAsync(Guid id, UpdateMissionDto dto, CancellationToken cancellationToken = default);
    Task<MissionDto> UpdateStatusAsync(Guid id, MissionStatus status, CancellationToken cancellationToken = default);
    Task<MissionDto> AssignAsync(Guid id, AssignMissionDto dto, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
