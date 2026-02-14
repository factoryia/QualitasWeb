'use client';

import { ReactNode } from 'react';
import { ProtectedAction } from './ProtectedAction';

interface ProtectedButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Single permission string or array of permissions to check
   */
  permission: string | string[];

  /**
   * Button content/label
   */
  children: ReactNode;

  /**
   * If true, user must have ALL permissions (AND logic)
   * If false, user must have ANY permission (OR logic)
   * @default false
   */
  requireAll?: boolean;

  /**
   * Optional fallback button (e.g., disabled button)
   */
  fallback?: ReactNode;

  /**
   * Optional tooltip text to show when user doesn't have permission
   */
  noPermissionTooltip?: string;
}

/**
 * Convenience component for permission-protected buttons
 * Automatically disables the button if user doesn't have permission
 *
 * @example
 * <ProtectedButton
 *   permission="Permissions.QualitasCompliance.MarcosNormativos.Create"
 *   onClick={handleCreate}
 *   className="btn btn-primary"
 * >
 *   Create Marco
 * </ProtectedButton>
 */
export function ProtectedButton({
  permission,
  children,
  requireAll = false,
  fallback,
  noPermissionTooltip,
  disabled,
  ...props
}: ProtectedButtonProps) {
  return (
    <ProtectedAction
      permission={permission}
      requireAll={requireAll}
      fallback={
        fallback || (
          <button
            disabled
            title={noPermissionTooltip || 'Insufficient permissions'}
            {...props}
          >
            {children}
          </button>
        )
      }
    >
      <button disabled={disabled} {...props}>
        {children}
      </button>
    </ProtectedAction>
  );
}
