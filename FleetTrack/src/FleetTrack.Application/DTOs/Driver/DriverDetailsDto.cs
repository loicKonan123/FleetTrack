using FleetTrack.Domain.Enums;

namespace FleetTrack.Application.DTOs.Driver;

public class DriverDetailsDto
{
    public Guid Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string FullName => $"{FirstName} {LastName}";
    public string Email { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string LicenseNumber { get; set; } = string.Empty;
    public DateTime LicenseExpiryDate { get; set; }
    public bool IsLicenseValid => LicenseExpiryDate >= DateTime.UtcNow.Date;
    public DriverStatus Status { get; set; }

    // Relations
    public CurrentVehicleInfoDto? CurrentVehicle { get; set; }
    public List<DriverMissionDto> ActiveMissions { get; set; } = new();
}

public class CurrentVehicleInfoDto
{
    public Guid Id { get; set; }
    public string RegistrationNumber { get; set; } = string.Empty;
    public string BrandModel { get; set; } = string.Empty;
}

public class DriverMissionDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public MissionStatus Status { get; set; }
    public DateTime StartDate { get; set; }
}
