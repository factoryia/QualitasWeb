'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { useHasPermission, useHasAnyPermission, useHasAllPermissions, usePermissions, useIsLoadingPermissions } from '@/features/auth/hooks/usePermission';
import { ProtectedButton } from '@/features/shared/components/ProtectedButton';
import { ProtectedAction } from '@/features/shared/components/ProtectedAction';
import { PERMISSIONS } from '@/features/auth/constants';

export default function DemoPermissionsPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'hooks' | 'components' | 'patterns'>('overview');

  const user = useAuthStore((state) => state.user);
  const permissions = usePermissions();
  const isLoading = useIsLoadingPermissions();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Demo hooks
  const canViewMarcos = useHasPermission(PERMISSIONS.QUALITAS.COMPLIANCE.MARCOS_NORMATIVOS.VIEW);
  const canCreateMarcos = useHasPermission(PERMISSIONS.QUALITAS.COMPLIANCE.MARCOS_NORMATIVOS.CREATE);
  const canModifyMarcos = useHasAnyPermission(
    PERMISSIONS.QUALITAS.COMPLIANCE.MARCOS_NORMATIVOS.UPDATE,
    PERMISSIONS.QUALITAS.COMPLIANCE.MARCOS_NORMATIVOS.DELETE
  );
  const hasFullAccess = useHasAllPermissions(
    PERMISSIONS.QUALITAS.COMPLIANCE.MARCOS_NORMATIVOS.VIEW,
    PERMISSIONS.QUALITAS.COMPLIANCE.MARCOS_NORMATIVOS.CREATE
  );

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 p-6 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">⚠️ No Autenticado</h1>
          <p className="text-gray-600 mb-6">Debes iniciar sesión para ver la demostración</p>
          <Link href="/login" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
            Ir al Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">🔐 Sistema de Permisos - Demostración Interactiva</h1>
          <p className="text-gray-600">Ejemplos en vivo de todos los patrones disponibles</p>
        </div>

        {/* User Info Card */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">👤 Tu Información</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs text-gray-600 font-semibold uppercase">Email</p>
              <p className="text-lg font-mono text-blue-900">{user?.email || 'N/A'}</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-xs text-gray-600 font-semibold uppercase">Nombre</p>
              <p className="text-lg font-mono text-green-900">{user?.fullName || 'N/A'}</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-xs text-gray-600 font-semibold uppercase">Rol</p>
              <p className="text-lg font-mono text-purple-900">{user?.role || 'N/A'}</p>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
              <p className="text-xs text-gray-600 font-semibold uppercase">Tenant</p>
              <p className="text-lg font-mono text-orange-900">{user?.tenant || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-2 border-b border-gray-200 bg-white rounded-t-lg overflow-hidden">
          {(['overview', 'hooks', 'components', 'patterns'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900 bg-gray-50'
              }`}
            >
              {tab === 'overview' && '📊 Resumen'}
              {tab === 'hooks' && '🪝 Hooks'}
              {tab === 'components' && '🧩 Componentes'}
              {tab === 'patterns' && '📐 Patrones'}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="bg-white rounded-b-lg shadow-lg p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold mb-4 text-gray-900">🔐 Tus Permisos ({permissions.length})</h3>
                {isLoading ? (
                  <p className="text-gray-600">Cargando permisos...</p>
                ) : permissions.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-96 overflow-y-auto">
                    {permissions.map((perm, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg text-sm font-mono"
                      >
                        <span className="text-green-600 font-bold">✓</span> {perm}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">No tienes permisos asignados</p>
                )}
              </div>

              <div className="border-t pt-6">
                <h3 className="text-xl font-bold mb-4 text-gray-900">📈 Resumen de Acceso</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className={`p-4 rounded-lg border-2 ${canViewMarcos ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'}`}>
                    <p className="font-semibold">{canViewMarcos ? '✅' : '❌'} Ver Marcos Normativos</p>
                    <p className="text-sm text-gray-600">Permiso: VIEW</p>
                  </div>
                  <div className={`p-4 rounded-lg border-2 ${canCreateMarcos ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'}`}>
                    <p className="font-semibold">{canCreateMarcos ? '✅' : '❌'} Crear Marcos Normativos</p>
                    <p className="text-sm text-gray-600">Permiso: CREATE</p>
                  </div>
                  <div className={`p-4 rounded-lg border-2 ${canModifyMarcos ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'}`}>
                    <p className="font-semibold">{canModifyMarcos ? '✅' : '❌'} Modificar Marcos (UPDATE O DELETE)</p>
                    <p className="text-sm text-gray-600">Permiso: UPDATE o DELETE</p>
                  </div>
                  <div className={`p-4 rounded-lg border-2 ${hasFullAccess ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'}`}>
                    <p className="font-semibold">{hasFullAccess ? '✅' : '❌'} Acceso Completo a Marcos (VIEW Y CREATE)</p>
                    <p className="text-sm text-gray-600">Permiso: VIEW Y CREATE</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Hooks Tab */}
          {activeTab === 'hooks' && (
            <div className="space-y-6">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-bold text-blue-900 mb-2">🪝 Hook: useHasPermission()</h4>
                <p className="text-sm text-gray-700 mb-3">Verifica UN permiso específico</p>
                <code className="block bg-gray-900 text-green-400 p-3 rounded text-xs overflow-x-auto mb-3">
                  {`const canViewMarcos = useHasPermission(
  PERMISSIONS.QUALITAS.COMPLIANCE.MARCOS_NORMATIVOS.VIEW
);`}
                </code>
                <p className="text-sm font-mono">
                  Resultado: <span className={canViewMarcos ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>{canViewMarcos ? 'true ✅' : 'false ❌'}</span>
                </p>
              </div>

              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-bold text-green-900 mb-2">🪝 Hook: useHasAnyPermission()</h4>
                <p className="text-sm text-gray-700 mb-3">Verifica si tienes CUALQUIERA de los permisos (OR Logic)</p>
                <code className="block bg-gray-900 text-green-400 p-3 rounded text-xs overflow-x-auto mb-3">
                  {`const canModify = useHasAnyPermission(
  PERMISSIONS.MARCOS.UPDATE,
  PERMISSIONS.MARCOS.DELETE
);`}
                </code>
                <p className="text-sm font-mono">
                  Resultado: <span className={canModifyMarcos ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>{canModifyMarcos ? 'true ✅' : 'false ❌'}</span>
                </p>
              </div>

              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <h4 className="font-bold text-purple-900 mb-2">🪝 Hook: useHasAllPermissions()</h4>
                <p className="text-sm text-gray-700 mb-3">Verifica si tienes TODOS los permisos (AND Logic)</p>
                <code className="block bg-gray-900 text-green-400 p-3 rounded text-xs overflow-x-auto mb-3">
                  {`const hasFullAccess = useHasAllPermissions(
  PERMISSIONS.MARCOS.VIEW,
  PERMISSIONS.MARCOS.CREATE
);`}
                </code>
                <p className="text-sm font-mono">
                  Resultado: <span className={hasFullAccess ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>{hasFullAccess ? 'true ✅' : 'false ❌'}</span>
                </p>
              </div>

              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <h4 className="font-bold text-orange-900 mb-2">🪝 Hook: usePermissions()</h4>
                <p className="text-sm text-gray-700 mb-3">Obtiene array de TODOS los permisos</p>
                <code className="block bg-gray-900 text-green-400 p-3 rounded text-xs overflow-x-auto mb-3">
                  {`const allPermissions = usePermissions();`}
                </code>
                <p className="text-sm font-mono">
                  Total de permisos: <span className="font-bold">{permissions.length}</span>
                </p>
              </div>
            </div>
          )}

          {/* Components Tab */}
          {activeTab === 'components' && (
            <div className="space-y-6">
              <div className="p-6 bg-blue-50 border-2 border-blue-200 rounded-lg">
                <h4 className="font-bold text-blue-900 mb-4">🧩 Componente: ProtectedButton</h4>
                <p className="text-sm text-gray-700 mb-4">Botón que se desactiva si no tienes permiso</p>

                <div className="space-y-3 mb-4">
                  <p className="text-sm font-semibold">Ejemplos:</p>

                  <div className="p-3 bg-white rounded border border-blue-100">
                    <p className="text-xs text-gray-600 mb-2">Con permiso VIEW:</p>
                    <ProtectedButton
                      permission={PERMISSIONS.QUALITAS.COMPLIANCE.MARCOS_NORMATIVOS.VIEW}
                      onClick={() => alert('¡Viendo marcos!')}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                    >
                      Ver Marcos
                    </ProtectedButton>
                  </div>

                  <div className="p-3 bg-white rounded border border-blue-100">
                    <p className="text-xs text-gray-600 mb-2">Con permiso CREATE:</p>
                    <ProtectedButton
                      permission={PERMISSIONS.QUALITAS.COMPLIANCE.MARCOS_NORMATIVOS.CREATE}
                      onClick={() => alert('¡Creando marco!')}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                    >
                      Crear Marco
                    </ProtectedButton>
                  </div>

                  <div className="p-3 bg-white rounded border border-blue-100">
                    <p className="text-xs text-gray-600 mb-2">Con permiso DELETE:</p>
                    <ProtectedButton
                      permission={PERMISSIONS.QUALITAS.COMPLIANCE.MARCOS_NORMATIVOS.DELETE}
                      onClick={() => alert('¡Eliminando marco!')}
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                    >
                      Eliminar Marco
                    </ProtectedButton>
                  </div>
                </div>

                <code className="block bg-gray-900 text-green-400 p-3 rounded text-xs overflow-x-auto">
                  {`<ProtectedButton
  permission={PERMISSIONS.MARCOS.CREATE}
  onClick={handleCreate}
  className="btn btn-primary"
>
  Crear Marco
</ProtectedButton>`}
                </code>
              </div>

              <div className="p-6 bg-green-50 border-2 border-green-200 rounded-lg">
                <h4 className="font-bold text-green-900 mb-4">🧩 Componente: ProtectedAction</h4>
                <p className="text-sm text-gray-700 mb-4">Renderizado condicional (envuelve JSX)</p>

                <div className="space-y-3 mb-4">
                  <p className="text-sm font-semibold">Ejemplos:</p>

                  <div className="p-3 bg-white rounded border border-green-100">
                    <p className="text-xs text-gray-600 mb-2">Con fallback:</p>
                    <ProtectedAction
                      permission={PERMISSIONS.QUALITAS.COMPLIANCE.MARCOS_NORMATIVOS.UPDATE}
                      fallback={<p className="text-gray-400 italic">No tienes permiso para editar</p>}
                    >
                      <p className="text-green-700 font-semibold">✅ Puedes editar marcos</p>
                    </ProtectedAction>
                  </div>

                  <div className="p-3 bg-white rounded border border-green-100">
                    <p className="text-xs text-gray-600 mb-2">Múltiples (OR Logic):</p>
                    <ProtectedAction
                      permission={[
                        PERMISSIONS.QUALITAS.COMPLIANCE.MARCOS_NORMATIVOS.CREATE,
                        PERMISSIONS.QUALITAS.COMPLIANCE.MARCOS_NORMATIVOS.UPDATE,
                      ]}
                      fallback={<p className="text-gray-400 italic">Sin permisos de creación o edición</p>}
                    >
                      <p className="text-green-700 font-semibold">✅ Puedes crear o editar marcos</p>
                    </ProtectedAction>
                  </div>
                </div>

                <code className="block bg-gray-900 text-green-400 p-3 rounded text-xs overflow-x-auto">
                  {`<ProtectedAction
  permission={PERMISSIONS.MARCOS.CREATE}
  fallback={<p>No tienes acceso</p>}
>
  <button>Crear Marco</button>
</ProtectedAction>`}
                </code>
              </div>
            </div>
          )}

          {/* Patterns Tab */}
          {activeTab === 'patterns' && (
            <div className="space-y-6">
              <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                <h4 className="font-bold text-indigo-900 mb-3">📐 Patrón 1: Botón Simple</h4>
                <p className="text-sm text-gray-700 mb-3">Un botón que se muestra si tienes permiso</p>
                <ProtectedButton
                  permission={PERMISSIONS.QUALITAS.COMPLIANCE.MARCOS_NORMATIVOS.CREATE}
                  onClick={() => alert('Crear marco')}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mb-3"
                >
                  Crear Marco
                </ProtectedButton>
              </div>

              <div className="p-4 bg-cyan-50 border border-cyan-200 rounded-lg">
                <h4 className="font-bold text-cyan-900 mb-3">📐 Patrón 2: Múltiples Acciones (OR)</h4>
                <p className="text-sm text-gray-700 mb-3">Usuario puede Crear O Actualizar</p>
                <ProtectedAction
                  permission={[
                    PERMISSIONS.QUALITAS.COMPLIANCE.MARCOS_NORMATIVOS.CREATE,
                    PERMISSIONS.QUALITAS.COMPLIANCE.MARCOS_NORMATIVOS.UPDATE,
                  ]}
                  fallback={<p className="text-gray-500">Sin permiso de creación o edición</p>}
                >
                  <button className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">Crear o Editar</button>
                </ProtectedAction>
              </div>

              <div className="p-4 bg-pink-50 border border-pink-200 rounded-lg">
                <h4 className="font-bold text-pink-900 mb-3">📐 Patrón 3: Acciones en Tabla</h4>
                <p className="text-sm text-gray-700 mb-3">Botones de editar/eliminar por fila</p>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Marcos</th>
                      <th className="text-right p-2">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {['ISO 27001', 'ISO 9001', 'MIPG'].map((marco) => (
                      <tr key={marco} className="border-b hover:bg-white/50">
                        <td className="p-2">{marco}</td>
                        <td className="text-right p-2 space-x-2">
                          <ProtectedButton
                            permission={PERMISSIONS.QUALITAS.COMPLIANCE.MARCOS_NORMATIVOS.UPDATE}
                            onClick={() => alert(`Editando ${marco}`)}
                            className="px-2 py-1 bg-yellow-600 text-white rounded text-xs hover:bg-yellow-700"
                          >
                            Editar
                          </ProtectedButton>
                          <ProtectedButton
                            permission={PERMISSIONS.QUALITAS.COMPLIANCE.MARCOS_NORMATIVOS.DELETE}
                            onClick={() => alert(`Eliminando ${marco}`)}
                            className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                          >
                            Eliminar
                          </ProtectedButton>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 flex justify-between items-center">
          <p className="text-gray-600 text-sm">
            📚 Lee más: <Link href="/docs" className="text-blue-600 hover:underline">PERMISSIONS_IMPLEMENTATION_GUIDE.md</Link>
          </p>
          <div className="space-x-3">
            <Link href="/dashboard" className="inline-block px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm">
              ← Volver al Dashboard
            </Link>
            <button
              onClick={() => useAuthStore.getState().logout()}
              className="inline-block px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
