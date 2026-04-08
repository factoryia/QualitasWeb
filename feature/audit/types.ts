export enum AuditEventType {
  None = 0,
  EntityChange = 1,
  Security = 2,
  Activity = 3,
  Exception = 4,
}

export enum AuditSeverity {
  None = 0,
  Trace = 1,
  Debug = 2,
  Information = 3,
  Warning = 4,
  Error = 5,
  Critical = 6,
}

export enum SecurityAction {
  None = 0,
  LoginSucceeded = 1,
  LoginFailed = 2,
  TokenIssued = 3,
  TokenRevoked = 4,
  PasswordChanged = 5,
  RoleAssigned = 6,
  RoleRevoked = 7,
  PermissionDenied = 8,
  PolicyFailed = 9,
}

export enum EntityOperation {
  None = 0,
  Insert = 1,
  Update = 2,
  Delete = 3,
  SoftDelete = 4,
  Restore = 5,
}

export enum ActivityKind {
  None = 0,
  Http = 1,
  BackgroundJob = 2,
  Command = 3,
  Query = 4,
  Integration = 5,
}

export enum ExceptionArea {
  None = 0,
  Api = 1,
  Worker = 2,
  Ui = 3,
  Infra = 4,
  Unknown = 255,
}

export enum BodyCapture {
  None = 0,
  Request = 1,
  Response = 2,
  Both = 3,
}

export enum AuditTag {
  None = 0,
  PiiMasked = 1 << 0,
  OutOfQuota = 1 << 1,
  Sampled = 1 << 2,
  RetainedLong = 1 << 3,
  HealthCheck = 1 << 4,
  Authentication = 1 << 5,
  Authorization = 1 << 6,
}

export interface AuditSummaryDto {
  id: string;
  occurredAtUtc: string;
  eventType: AuditEventType | string;
  severity: AuditSeverity | string;
  tenantId?: string;
  userId?: string;
  userName?: string;
  traceId?: string;
  correlationId?: string;
  requestId?: string;
  source?: string;
  tags: AuditTag;
}

export interface AuditSummaryAggregateDto {
  eventsByType: Record<string, number>;
  eventsBySeverity: Record<string, number>;
  eventsBySource: Record<string, number>;
  eventsByTenant: Record<string, number>;
}

export interface AuditDetailDto {
  id: string;
  occurredAtUtc: string;
  receivedAtUtc: string;
  eventType: AuditEventType | string;
  severity: AuditSeverity | string;
  tenantId?: string;
  userId?: string;
  userName?: string;
  traceId?: string;
  spanId?: string;
  correlationId?: string;
  requestId?: string;
  source?: string;
  tags: AuditTag;
  payload: any;
}

export interface GetAuditsQuery {
  pageNumber?: number;
  pageSize?: number;
  sort?: string;
  userId?: string;
  tenantId?: string;
  eventType?: AuditEventType;
  severity?: AuditSeverity;
  tags?: AuditTag;
  source?: string;
  correlationId?: string;
  traceId?: string;
  fromUtc?: string;
  toUtc?: string;
  search?: string;
}

export interface PagedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}
