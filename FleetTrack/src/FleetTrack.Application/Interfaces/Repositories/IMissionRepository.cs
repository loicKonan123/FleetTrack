using FleetTrack.Domain.Entities;
using FleetTrack.Domain.Enums;

namespace FleetTrack.Application.Interfaces.Repositories;

public interface IMissionRepository
{
    Task<Mission?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IEnumerable<Mission>> GetPagedAsync(int pageNumber, int pageSize, CancellationToken cancellationToken = default);
    Task<int> CountAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<Mission>> GetActiveMissionsAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<Mission>> GetMissionsByStatusAsync(MissionStatus status, CancellationToken cancellationToken = default);
    Task<IEnumerable<Mission>> GetMissionsByVehicleIdAsync(Guid vehicleId, CancellationToken cancellationToken = default);
    Task<IEnumerable<Mission>> GetMissionsByDriverIdAsync(Guid driverId, CancellationToken cancellationToken = default);
    Task<IEnumerable<Mission>> GetMissionsByPriorityAsync(MissionPriority priority, CancellationToken cancellationToken = default);
    Task<IEnumerable<Mission>> GetMissionsForDateRangeAsync(DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default);
    Task<Mission?> GetMissionWithDetailsAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IEnumerable<Mission>> GetOverdueMissionsAsync(CancellationToken cancellationToken = default);
    Task<Mission> AddAsync(Mission mission, CancellationToken cancellationToken = default);
    Task UpdateAsync(Mission mission, CancellationToken cancellationToken = default);
    Task DeleteAsync(Mission mission, CancellationToken cancellationToken = default);
}
