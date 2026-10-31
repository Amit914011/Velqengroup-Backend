export interface RoleCred {
  role: string;
  col: string;
  email: string;
  pbPass: string;
  srvPass: string;
}

export interface DiffResult {
  category: 'READ' | 'WRITE' | 'FRONTEND';
  collection: string;
  role: string;
  operation: string;
  pbStatus: number;
  srvStatus: number;
  pbTotal?: number;
  srvTotal?: number;
  statusMatch: boolean;
  dataMatch: boolean;
  securityViolation: boolean;
  isTimeout?: boolean;
  notes?: string;
}

export interface CollectionSummary {
  name: string;
  listOk: number;
  viewOk: number;
  mismatches: number;
  securityViolations: number;
  timeouts: number;
}

