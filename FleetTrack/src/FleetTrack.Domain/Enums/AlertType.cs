namespace FleetTrack.Domain.Enums;

public enum AlertType
{
    Speeding = 0,
    HarshBraking = 1,
    HarshAcceleration = 2,
    IdleTime = 3,
    LowFuel = 4,
    MaintenanceDue = 5,
    GeofenceViolation = 6,
    UnauthorizedMovement = 7,
    EngineFailure = 8,
    BatteryLow = 9,
    Other = 10
}
