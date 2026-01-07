using FleetTrack.Domain.Enums;

namespace FleetTrack.Application.DTOs.Maintenance;

public class MaintenanceDto
{
    public Guid Id { get; set; }
    public MaintenanceType Type { get; set; }
    public string TypeName => Type.ToString();
    public string Description { get; set; } = string.Empty;
    public DateTime ScheduledDate { get; set; }
    public DateTime? CompletedDate { get; set; }
    public int MileageAtMaintenance { get; set; }
    public decimal Cost { get; set; }
    public string? ServiceProvider { get; set; }
    public string? Notes { get; set; }
    public bool IsCompleted { get; set; }
    public Guid VehicleId { get; set; }
    public string? VehicleRegistration { get; set; }
    public string? VehicleBrand { get; set; }
    public string? VehicleModel { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public class CreateMaintenanceDto
{
    public MaintenanceType Type { get; set; }
    public string Description { get; set; } = string.Empty;
    public DateTime ScheduledDate { get; set; }
    public int MileageAtMaintenance { get; set; }
    public decimal Cost { get; set; }
    public string? ServiceProvider { get; set; }
    public string? Notes { get; set; }
    public Guid VehicleId { get; set; }
}

public class UpdateMaintenanceDto
{
    public MaintenanceType? Type { get; set; }
    public string? Description { get; set; }
    public DateTime? ScheduledDate { get; set; }
    public DateTime? CompletedDate { get; set; }
    public int? MileageAtMaintenance { get; set; }
    public decimal? Cost { get; set; }
    public string? ServiceProvider { get; set; }
    public string? Notes { get; set; }
    public bool? IsCompleted { get; set; }
}

public class CompleteMaintenanceDto
{
    public DateTime CompletedDate { get; set; } = DateTime.UtcNow;
    public int? MileageAtMaintenance { get; set; }
    public decimal? Cost { get; set; }
    public string? Notes { get; set; }
}
