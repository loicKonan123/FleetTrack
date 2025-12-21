using FleetTrack.Domain.Enums;

namespace FleetTrack.Application.DTOs.Driver;

public class UpdateDriverDto
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public DateTime LicenseExpiryDate { get; set; }
    public DriverStatus Status { get; set; }
}
