'use client';

/**
 * Example Component - Demonstrates all permission patterns
 *
 * This component shows various ways to implement permission-based
 * authorization in the frontend. Use these patterns in your own components.
 *
 * NOT meant to be used in production - for learning/reference only.
 */

import { useHasPermission, useHasAnyPermission, useHasAllPermissions, usePermissions, useIsLoadingPermissions } from '@/features/auth/hooks/usePermission';
import { ProtectedAction } from '../components/ProtectedAction';
import { ProtectedButton } from '../components/ProtectedButton';
import { QualitasCompliancePermissions, QualitasOperationsPermissions } from '../constants/permissions';

export function PermissionsExampleComponent() {
  // Hook examples
  const canCreateMarco = useHasPermission(
    QualitasCompliancePermissions.MarcosNormativos.Create
  );

  const canModifyClausula = useHasAnyPermission(
    QualitasCompliancePermissions.ClausulasRequisitos.Create,
    QualitasCompliancePermissions.ClausulasRequisitos.Update,
    QualitasCompliancePermissions.ClausulasRequisitos.Delete
  );

  const hasFullComplianceAccess = useHasAllPermissions(
    QualitasCompliancePermissions.MarcosNormativos.View,
    QualitasCompliancePermissions.MarcosNormativos.Create,
    QualitasCompliancePermissions.MarcosNormativos.Update,
    QualitasCompliancePermissions.MarcosNormativos.Delete
  );

  const allPermissions = usePermissions();
  const isLoadingPermissions = useIsLoadingPermissions();

  if (isLoadingPermissions) {
    return <div className="p-4">Loading permissions...</div>;
  }

  return (
    <div className="p-6 space-y-8 bg-gray-50">
      <h1 className="text-3xl font-bold">Permission System Examples</h1>

      {/* Section 1: Hook Examples */}
      <section className="bg-white p-4 rounded border-l-4 border-blue-500">
        <h2 className="text-2xl font-bold mb-4">1. Hook Examples</h2>

        {/* Single Permission Hook */}
        <div className="mb-4 p-3 bg-gray-100 rounded">
          <p className="font-semibold">
            Single Permission Check:
          </p>
          <p className="text-sm text-gray-600">
            Can Create Marco: <span className="font-bold">{canCreateMarco ? '✅ Yes' : '❌ No'}</span>
          </p>
          {canCreateMarco && (
            <button className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-sm">
              Create Marco Button
            </button>
          )}
        </div>

        {/* Multiple Permissions (OR) */}
        <div className="mb-4 p-3 bg-gray-100 rounded">
          <p className="font-semibold">
            Multiple Permissions (OR Logic - Any):
          </p>
          <p className="text-sm text-gray-600">
            Can Modify Clausula: <span className="font-bold">{canModifyClausula ? '✅ Yes' : '❌ No'}</span>
          </p>
          <p className="text-xs text-gray-500 mt-1">
            (Can Create OR Update OR Delete)
          </p>
        </div>

        {/* Multiple Permissions (AND) */}
        <div className="p-3 bg-gray-100 rounded">
          <p className="font-semibold">
            Multiple Permissions (AND Logic - All):
          </p>
          <p className="text-sm text-gray-600">
            Has Full Compliance Access: <span className="font-bold">{hasFullComplianceAccess ? '✅ Yes' : '❌ No'}</span>
          </p>
          <p className="text-xs text-gray-500 mt-1">
            (Must View AND Create AND Update AND Delete)
          </p>
        </div>
      </section>

      {/* Section 2: Component Examples */}
      <section className="bg-white p-4 rounded border-l-4 border-green-500">
        <h2 className="text-2xl font-bold mb-4">2. Component Examples</h2>

        {/* ProtectedAction - Single Permission */}
        <div className="mb-6">
          <h3 className="font-semibold mb-2">ProtectedAction - Single Permission</h3>
          <ProtectedAction permission={QualitasCompliancePermissions.MarcosNormativos.Create}>
            <button className="px-4 py-2 bg-blue-500 text-white rounded">
              Create Marco (ProtectedAction)
            </button>
          </ProtectedAction>
          <p className="text-xs text-gray-500 mt-2">
            This button only shows if user has Create permission
          </p>
        </div>

        {/* ProtectedAction - Multiple Permissions (OR) */}
        <div className="mb-6">
          <h3 className="font-semibold mb-2">ProtectedAction - Multiple Permissions (OR)</h3>
          <ProtectedAction
            permission={[
              QualitasCompliancePermissions.MarcosNormativos.Create,
              QualitasCompliancePermissions.MarcosNormativos.Update,
            ]}
            fallback={<span className="text-gray-400">No Create or Update permission</span>}
          >
            <button className="px-4 py-2 bg-blue-500 text-white rounded">
              Create or Update Marco
            </button>
          </ProtectedAction>
          <p className="text-xs text-gray-500 mt-2">
            Shows button if user has Create OR Update permission. Shows fallback if neither.
          </p>
        </div>

        {/* ProtectedAction - Multiple Permissions (AND) */}
        <div className="mb-6">
          <h3 className="font-semibold mb-2">ProtectedAction - Multiple Permissions (AND)</h3>
          <ProtectedAction
            permission={[
              QualitasCompliancePermissions.MarcosNormativos.View,
              QualitasCompliancePermissions.MarcosNormativos.Update,
            ]}
            requireAll={true}
            fallback={<span className="text-gray-400">Requires View AND Update permissions</span>}
          >
            <button className="px-4 py-2 bg-blue-500 text-white rounded">
              View and Update Marco
            </button>
          </ProtectedAction>
          <p className="text-xs text-gray-500 mt-2">
            Shows button only if user has BOTH View AND Update permissions.
          </p>
        </div>

        {/* ProtectedButton - Simple */}
        <div className="mb-6">
          <h3 className="font-semibold mb-2">ProtectedButton - Simple</h3>
          <ProtectedButton
            permission={QualitasCompliancePermissions.MarcosNormativos.Delete}
            onClick={() => console.log('Delete clicked')}
            className="px-4 py-2 bg-red-500 text-white rounded"
            noPermissionTooltip="You don't have permission to delete marcos"
          >
            Delete Marco
          </ProtectedButton>
          <p className="text-xs text-gray-500 mt-2">
            Automatically disables button if user doesn't have permission.
          </p>
        </div>

        {/* ProtectedButton - Multiple Permissions */}
        <div>
          <h3 className="font-semibold mb-2">ProtectedButton - Multiple Permissions</h3>
          <div className="space-x-2">
            <ProtectedButton
              permission={QualitasCompliancePermissions.ClausulasRequisitos.Create}
              onClick={() => console.log('Create clicked')}
              className="px-4 py-2 bg-green-500 text-white rounded"
            >
              Create Clausula
            </ProtectedButton>

            <ProtectedButton
              permission={QualitasCompliancePermissions.ClausulasRequisitos.Update}
              onClick={() => console.log('Update clicked')}
              className="px-4 py-2 bg-yellow-500 text-white rounded"
            >
              Update Clausula
            </ProtectedButton>

            <ProtectedButton
              permission={QualitasCompliancePermissions.ClausulasRequisitos.Delete}
              onClick={() => console.log('Delete clicked')}
              className="px-4 py-2 bg-red-500 text-white rounded"
            >
              Delete Clausula
            </ProtectedButton>
          </div>
        </div>
      </section>

      {/* Section 3: Advanced Examples */}
      <section className="bg-white p-4 rounded border-l-4 border-purple-500">
        <h2 className="text-2xl font-bold mb-4">3. Advanced Examples</h2>

        {/* Conditional Form Fields */}
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Conditional Form Fields</h3>
          <form className="space-y-3 p-3 bg-gray-100 rounded">
            <div>
              <label className="block text-sm font-medium mb-1">Código *</label>
              <input
                type="text"
                placeholder="Required for all"
                className="w-full px-3 py-2 border rounded text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Nombre *</label>
              <input
                type="text"
                placeholder="Required for all"
                className="w-full px-3 py-2 border rounded text-sm"
              />
            </div>

            {/* This field only visible to users who can update */}
            <ProtectedAction permission={QualitasCompliancePermissions.MarcosNormativos.Update}>
              <div>
                <label className="block text-sm font-medium mb-1">Descripción (Edit Only)</label>
                <textarea
                  placeholder="Only visible to users with Update permission"
                  className="w-full px-3 py-2 border rounded text-sm"
                  rows={3}
                ></textarea>
              </div>
            </ProtectedAction>

            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium"
            >
              Save
            </button>
          </form>
        </div>

        {/* Conditional Data Display */}
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Conditional Data Table Actions</h3>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2 text-left">Marco</th>
                <th className="border p-2 text-left">Código</th>
                <th className="border p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="border p-2">ISO 27001:2022</td>
                <td className="border p-2">ISO27001</td>
                <td className="border p-2 space-x-1">
                  <ProtectedButton
                    permission={QualitasCompliancePermissions.MarcosNormativos.Update}
                    onClick={() => console.log('Edit')}
                    className="px-2 py-1 bg-yellow-500 text-white rounded text-xs"
                  >
                    Edit
                  </ProtectedButton>

                  <ProtectedButton
                    permission={QualitasCompliancePermissions.MarcosNormativos.Delete}
                    onClick={() => console.log('Delete')}
                    className="px-2 py-1 bg-red-500 text-white rounded text-xs"
                  >
                    Delete
                  </ProtectedButton>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Section 4: Debug Info */}
      <section className="bg-white p-4 rounded border-l-4 border-orange-500">
        <h2 className="text-2xl font-bold mb-4">4. Debug Information</h2>

        <div className="p-3 bg-gray-100 rounded font-mono text-sm max-h-64 overflow-auto">
          <p className="font-semibold mb-2">All User Permissions ({allPermissions.length} total):</p>
          {allPermissions.length === 0 ? (
            <p className="text-gray-500">No permissions assigned to this user</p>
          ) : (
            <ul className="space-y-1">
              {allPermissions.map((perm, idx) => (
                <li key={idx} className="text-green-700">
                  ✓ {perm}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Section 5: Notes */}
      <section className="bg-yellow-50 p-4 rounded border-l-4 border-yellow-500">
        <h2 className="text-xl font-semibold mb-2">ℹ️ Important Notes</h2>
        <ul className="text-sm space-y-1">
          <li>
            ✅ <strong>Frontend permissions</strong> are for UX only (hiding/showing buttons)
          </li>
          <li>
            ✅ <strong>Backend permissions</strong> are ALWAYS enforced (security critical)
          </li>
          <li>
            ✅ <strong>Never trust frontend</strong> - always check permissions on backend with `.RequirePermission()`
          </li>
          <li>
            ✅ <strong>Use permission constants</strong> - prevents typos and mismatches
          </li>
          <li>
            ✅ <strong>Default to hiding</strong> - only show what user is permitted to see
          </li>
        </ul>
      </section>
    </div>
  );
}
