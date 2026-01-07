using FleetTrack.Domain.Enums;

namespace FleetTrack.Application.DTOs.Alert;

public class AlertDto
{
    public Guid Id { get; set; }
    public AlertType Type { get; set; }
    public string TypeName => Type.ToString();
    public AlertSeverity Severity { get; set; }
    public string SeverityName => Severity.ToString();
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public DateTime TriggeredAt { get; set; }
    public bool IsAcknowledged { get; set; }
    public DateTime? AcknowledgedAt { get; set; }
    public string? AcknowledgedBy { get; set; }
    public bool IsResolved { get; set; }
    public DateTime? ResolvedAt { get; set; }
    public string? Resolution { get; set; }
    public Guid VehicleId { get; set; }
    public string? VehicleRegistration { get; set; }
    public string? VehicleBrand { get; set; }
    public string? VehicleModel { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateAlertDto
{
    public AlertType Type { get; set; }
    public AlertSeverity Severity { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public Guid VehicleId { get; set; }
}

public class AcknowledgeAlertDto
{
    public string AcknowledgedBy { get; set; } = string.Empty;
}

public class ResolveAlertDto
{
    public string Resolution { get; set; } = string.Empty;
}
