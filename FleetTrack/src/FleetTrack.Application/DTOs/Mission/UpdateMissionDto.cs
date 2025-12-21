using FleetTrack.Domain.Enums;

namespace FleetTrack.Application.DTOs.Mission;

public class UpdateMissionDto
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public MissionStatus Status { get; set; }
    public MissionPriority Priority { get; set; }
    public DateTime? EndDate { get; set; }
    public double? ActualDistance { get; set; }
}
