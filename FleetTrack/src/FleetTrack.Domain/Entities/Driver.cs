using FleetTrack.Domain.Enums;

namespace FleetTrack.Domain.Entities;

public class Driver : BaseEntity
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string LicenseNumber { get; set; } = string.Empty;
    public DateTime LicenseExpiryDate { get; set; }
    public DriverStatus Status { get; set; }
    public DateTime? LastActiveDate { get; set; }

    // Navigation properties
    public Guid? CurrentVehicleId { get; set; }
    public Vehicle? CurrentVehicle { get; set; }
    public ICollection<Mission> Missions { get; set; } = new List<Mission>();
}
