export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
  accessTokenExpiresAt: string;
}

/**
 * JWT Payload interface for type-safe token decoding
 * Represents the decoded content of the access token
 */
export interface JWTPayload {
  jti: string;
  email_address?: string;
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'?: string;
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'?: string;
  'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'?: string;
  fullName?: string;
  tenant?: string;
  image_url?: string;
  exp: number;
  iat: number;
}
