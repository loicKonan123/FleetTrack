export enum AlertType {
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

export const AlertTypeLabels: Record<AlertType, string> = {
  [AlertType.Speeding]: 'Excès de vitesse',
  [AlertType.HarshBraking]: 'Freinage brusque',
  [AlertType.HarshAcceleration]: 'Accélération brusque',
  [AlertType.IdleTime]: 'Temps d\'arrêt',
  [AlertType.LowFuel]: 'Carburant bas',
  [AlertType.MaintenanceDue]: 'Maintenance requise',
  [AlertType.GeofenceViolation]: 'Violation de zone',
  [AlertType.UnauthorizedMovement]: 'Mouvement non autorisé',
  [AlertType.EngineFailure]: 'Panne moteur',
  [AlertType.BatteryLow]: 'Batterie faible',
  [AlertType.Other]: 'Autre'
};

export enum AlertSeverity {
  Info = 0,
  Warning = 1,
  Error = 2,
  Critical = 3
}

export const AlertSeverityLabels: Record<AlertSeverity, string> = {
  [AlertSeverity.Info]: 'Info',
  [AlertSeverity.Warning]: 'Avertissement',
  [AlertSeverity.Error]: 'Erreur',
  [AlertSeverity.Critical]: 'Critique'
};

export const AlertSeverityColors: Record<AlertSeverity, string> = {
  [AlertSeverity.Info]: 'bg-blue-100 text-blue-800',
  [AlertSeverity.Warning]: 'bg-yellow-100 text-yellow-800',
  [AlertSeverity.Error]: 'bg-orange-100 text-orange-800',
  [AlertSeverity.Critical]: 'bg-red-100 text-red-800'
};

export interface AlertDto {
  id: string;
  type: AlertType;
  typeName: string;
  severity: AlertSeverity;
  severityName: string;
  title: string;
  message: string;
  triggeredAt: string;
  isAcknowledged: boolean;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  isResolved: boolean;
  resolvedAt?: string;
  resolution?: string;
  vehicleId: string;
  vehicleRegistration?: string;
  vehicleBrand?: string;
  vehicleModel?: string;
  createdAt: string;
}

export interface CreateAlertRequest {
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  vehicleId: string;
}

export interface AcknowledgeAlertRequest {
  acknowledgedBy: string;
}

export interface ResolveAlertRequest {
  resolution: string;
}
