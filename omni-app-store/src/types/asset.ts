export interface CoreIdentity {
  display_name: string;
  manufacturer: string;
  model_number: string;
  serial_number: string;
  asset_category: 'manipulator' | 'end_effector' | 'cnc';
  image_url: string;
}

export interface OperationalStatus {
  is_available: boolean;
  health_status: 'online' | 'warning' | 'error';
  location_area: string;
}

export interface TechnicalSpecs {
  payload_capacity_kg: number;
  reach_radius_mm: number;
  supported_protocols: string[];
}

export interface CurrentConfiguration {
  mounted_tool_id: string | null;
}

export interface Asset {
  asset_id: string;
  owner_id: string;
  core_identity: CoreIdentity;
  operational_status: OperationalStatus;
  technical_specs: TechnicalSpecs;
  current_configuration: CurrentConfiguration;
}