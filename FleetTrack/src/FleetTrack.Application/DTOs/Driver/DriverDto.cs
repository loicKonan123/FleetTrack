using FleetTrack.Domain.Enums;

namespace FleetTrack.Application.DTOs.Driver;

public class DriverDto
{
    public Guid Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string FullName => $"{FirstName} {LastName}";
    public string Email { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string LicenseNumber { get; set; } = string.Empty;
    public DateTime LicenseExpiryDate { get; set; }
    public DriverStatus Status { get; set; }
    public Guid? CurrentVehicleId { get; set; }
    public string? CurrentVehicleRegistration { get; set; }
}
