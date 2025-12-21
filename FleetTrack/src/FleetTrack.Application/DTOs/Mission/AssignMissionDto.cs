namespace FleetTrack.Application.DTOs.Mission;

public class AssignMissionDto
{
    public Guid VehicleId { get; set; }
    public Guid DriverId { get; set; }
    public DateTime StartDate { get; set; }
}
