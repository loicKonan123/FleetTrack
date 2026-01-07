export enum MaintenanceType {
  Preventive = 0,
  Corrective = 1,
  OilChange = 2,
  TireChange = 3,
  BrakeService = 4,
  Inspection = 5,
  Repair = 6,
  Other = 7
}

export const MaintenanceTypeLabels: Record<MaintenanceType, string> = {
  [MaintenanceType.Preventive]: 'Préventive',
  [MaintenanceType.Corrective]: 'Corrective',
  [MaintenanceType.OilChange]: 'Vidange',
  [MaintenanceType.TireChange]: 'Changement pneus',
  [MaintenanceType.BrakeService]: 'Freins',
  [MaintenanceType.Inspection]: 'Inspection',
  [MaintenanceType.Repair]: 'Réparation',
  [MaintenanceType.Other]: 'Autre'
};

export interface MaintenanceDto {
  id: string;
  type: MaintenanceType;
  typeName: string;
  description: string;
  scheduledDate: string;
  completedDate?: string;
  mileageAtMaintenance: number;
  cost: number;
  serviceProvider?: string;
  notes?: string;
  isCompleted: boolean;
  vehicleId: string;
  vehicleRegistration?: string;
  vehicleBrand?: string;
  vehicleModel?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateMaintenanceRequest {
  type: MaintenanceType;
  description: string;
  scheduledDate: string;
  mileageAtMaintenance: number;
  cost: number;
  serviceProvider?: string;
  notes?: string;
  vehicleId: string;
}

export interface UpdateMaintenanceRequest {
  type?: MaintenanceType;
  description?: string;
  scheduledDate?: string;
  completedDate?: string;
  mileageAtMaintenance?: number;
  cost?: number;
  serviceProvider?: string;
  notes?: string;
  isCompleted?: boolean;
}

export interface CompleteMaintenanceRequest {
  completedDate?: string;
  mileageAtMaintenance?: number;
  cost?: number;
  notes?: string;
}
