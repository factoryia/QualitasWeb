# Guía Completa - Sistema de Permisos Frontend

**Última actualización**: 14 de febrero de 2026
**Estado**: ✅ Producción
**Audiencia**: Desarrolladores Frontend

---

## 📖 Tabla de Contenidos

1. [Inicio Rápido (5 min)](#inicio-rápido)
2. [Cómo Funciona](#cómo-funciona)
3. [7 Patrones de Implementación](#patrones)
4. [Referencia API Completa](#referencia)
5. [Mejores Prácticas](#mejores-prácticas)
6. [Solución de Problemas](#troubleshooting)

---

## Inicio Rápido

### Opción 1: ProtectedButton (Más Simple)

```typescript
import { ProtectedButton } from '@/features/shared/components/ProtectedButton';
import { QualitasCompliancePermissions } from '@/features/auth/constants';

export function MarcosActions() {
  return (
    <ProtectedButton
      permission={QualitasCompliancePermissions.MARCOS_NORMATIVOS.CREATE}
      onClick={handleCreate}
      className="btn btn-primary"
    >
      Crear Marco
    </ProtectedButton>
  );
}
```

**Ventajas**: Código más limpio, auto-deshabilitación
**Desventajas**: Menos control, solo para botones

### Opción 2: Hook useHasPermission (Más Control)

```typescript
import { useHasPermission } from '@/features/auth/hooks/usePermission';
import { QualitasCompliancePermissions } from '@/features/auth/constants';

export function MarcosActions() {
  const canCreate = useHasPermission(
    QualitasCompliancePermissions.MARCOS_NORMATIVOS.CREATE
  );

  if (!canCreate) {
    return <p className="text-gray-500">No tienes permiso para crear marcos</p>;
  }

  return <button onClick={handleCreate}>Crear Marco</button>;
}
```

**Ventajas**: Control total, lógica flexible
**Desventajas**: Más código, responsabilidad del dev

### Opción 3: ProtectedAction (Intermedio)

```typescript
import { ProtectedAction } from '@/features/shared/components/ProtectedAction';
import { QualitasCompliancePermissions } from '@/features/auth/constants';

export function MarcosActions() {
  return (
    <ProtectedAction
      permission={QualitasCompliancePermissions.MARCOS_NORMATIVOS.CREATE}
      fallback={<p className="text-gray-400">Permiso requerido</p>}
    >
      <button onClick={handleCreate}>Crear Marco</button>
    </ProtectedAction>
  );
}
```

**Ventajas**: Código limpio, contenido fallback
**Desventajas**: Solo para renderizado

---

## Cómo Funciona

### Flujo Automático

```
1. Usuario inicia sesión
   ↓
2. authService.login() obtiene JWT + refreshToken
   ↓
3. Automáticamente solicita /api/v1/identity/users/permissions
   ↓
4. Backend retorna: ["Permissions.Module.Entity.Action", ...]
   ↓
5. Se almacena en auth.store.permissions
   ↓
6. Componentes acceden via hooks
```

### Almacenamiento

Permisos se **persisten automáticamente** en sessionStorage (no localStorage por seguridad).

### Estado Store

```typescript
// En @/features/auth/store/auth.store.ts
interface AuthState {
  permissions: string[];                    // Array de permisos
  isLoadingPermissions: boolean;           // Si se está cargando
  setPermissions: (perms: string[]) => void;
  setLoadingPermissions: (loading: boolean) => void;
}
```

---

## Patrones

### Patrón 1: Botón Simple

**Caso**: Un botón que se muestra si tienes permiso

```typescript
<ProtectedButton
  permission={QualitasCompliancePermissions.MARCOS_NORMATIVOS.DELETE}
  onClick={handleDelete}
  className="btn btn-danger"
>
  Eliminar
</ProtectedButton>
```

**Qué hace**:
- Si tienes permiso → botón habilitado
- Si no → botón deshabilitado (disabled="true")

---

### Patrón 2: Múltiples Permisos (OR Logic)

**Caso**: Usuario puede Crear O Actualizar

```typescript
<ProtectedAction
  permission={[
    QualitasCompliancePermissions.MARCOS_NORMATIVOS.CREATE,
    QualitasCompliancePermissions.MARCOS_NORMATIVOS.UPDATE,
  ]}
  fallback={<p>Requiere permiso Create o Update</p>}
>
  <button>Crear o Editar Marco</button>
</ProtectedAction>
```

**Qué hace**:
- Si tienes cualquiera → muestra contenido
- Si no tienes ninguno → muestra fallback

---

### Patrón 3: Múltiples Permisos (AND Logic)

**Caso**: Usuario debe tener View Y Create

```typescript
<ProtectedAction
  permission={[
    QualitasCompliancePermissions.MARCOS_NORMATIVOS.VIEW,
    QualitasCompliancePermissions.MARCOS_NORMATIVOS.CREATE,
  ]}
  requireAll={true}
  fallback={<p>Requiere permisos View Y Create</p>}
>
  <button>Panel Avanzado</button>
</ProtectedAction>
```

**Qué hace**:
- Si tienes TODOS → muestra contenido
- Si falta alguno → muestra fallback

---

### Patrón 4: Hook para Lógica

**Caso**: Verificar permiso antes de hacer algo

```typescript
export function useMarcosOperations() {
  const canCreate = useHasPermission(
    QualitasCompliancePermissions.MARCOS_NORMATIVOS.CREATE
  );

  const create = async (data: CreateMarcoRequest) => {
    // Verificar frontend primero
    if (!canCreate) {
      throw new Error('No tienes permiso para crear');
    }

    // Backend también verifica (seguridad)
    return api.post('/api/v1/qualitas/compliance/marcos-normativos', data);
  };

  return { create, canCreate };
}
```

---

### Patrón 5: Campos Condicionales en Forma

**Caso**: Mostrar campos solo para usuarios con Update

```typescript
<form>
  <input type="text" placeholder="Código (requerido)" required />
  <input type="text" placeholder="Nombre (requerido)" required />

  {/* Solo para usuarios con Update */}
  <ProtectedAction permission={QualitasCompliancePermissions.MARCOS_NORMATIVOS.UPDATE}>
    <textarea placeholder="Descripción (solo edición)"></textarea>
  </ProtectedAction>

  <button type="submit">Guardar</button>
</form>
```

---

### Patrón 6: Acciones en Tabla

**Caso**: Botones de editar/eliminar en filas

```typescript
<table>
  <tbody>
    {marcos.map((marco) => (
      <tr key={marco.id}>
        <td>{marco.nombre}</td>
        <td>
          <ProtectedButton
            permission={QualitasCompliancePermissions.MARCOS_NORMATIVOS.UPDATE}
            onClick={() => handleEdit(marco.id)}
            className="btn btn-sm btn-warning"
          >
            Editar
          </ProtectedButton>

          <ProtectedButton
            permission={QualitasCompliancePermissions.MARCOS_NORMATIVOS.DELETE}
            onClick={() => handleDelete(marco.id)}
            className="btn btn-sm btn-danger"
          >
            Eliminar
          </ProtectedButton>
        </td>
      </tr>
    ))}
  </tbody>
</table>
```

---

### Patrón 7: Menú/Navegación Condicional

**Caso**: Mostrar items de menú solo si tienes permiso

```typescript
export function Navigation() {
  const canViewMarcosNormativos = useHasPermission(
    QualitasCompliancePermissions.MARCOS_NORMATIVOS.VIEW
  );
  const canViewClausulas = useHasPermission(
    QualitasCompliancePermissions.CLAUSULAS_REQUISITOS.VIEW
  );

  return (
    <nav>
      {canViewMarcosNormativos && (
        <a href="/marcos-normativos">Marcos Normativos</a>
      )}

      {canViewClausulas && (
        <a href="/clausulas-requisitos">Clausulas Requisitos</a>
      )}
    </nav>
  );
}
```

---

## Referencia

### Hooks Disponibles

#### `useHasPermission(permission: string): boolean`

Verifica si tienes UN permiso específico.

```typescript
const canView = useHasPermission('Permissions.QualitasCompliance.MarcosNormativos.View');
```

---

#### `useHasAnyPermission(...permissions: string[]): boolean`

Verifica si tienes CUALQUIERA de los permisos (OR Logic).

```typescript
const canModify = useHasAnyPermission(
  'Permissions.QualitasCompliance.MarcosNormativos.Create',
  'Permissions.QualitasCompliance.MarcosNormativos.Update',
  'Permissions.QualitasCompliance.MarcosNormativos.Delete'
);
```

---

#### `useHasAllPermissions(...permissions: string[]): boolean`

Verifica si tienes TODOS los permisos (AND Logic).

```typescript
const hasFullAccess = useHasAllPermissions(
  'Permissions.QualitasCompliance.MarcosNormativos.View',
  'Permissions.QualitasCompliance.MarcosNormativos.Create'
);
```

---

#### `usePermissions(): string[]`

Obtiene el array completo de permisos del usuario.

```typescript
const allPerms = usePermissions();
console.log(allPerms); // ['Permissions.QualitasCompliance.MarcosNormativos.View', ...]
```

---

#### `useIsLoadingPermissions(): boolean`

Verifica si los permisos aún se están cargando.

```typescript
const isLoading = useIsLoadingPermissions();
if (isLoading) return <Spinner />;
```

---

### Componentes Disponibles

#### `<ProtectedAction>`

Renderizado condicional basado en permisos.

**Props**:
- `permission: string | string[]` - Permiso(s) a verificar
- `children: ReactNode` - Contenido si tiene permiso
- `fallback?: ReactNode` - Contenido si NO tiene permiso
- `requireAll?: boolean` - AND (true) vs OR (false, default)

**Ejemplos**:

```typescript
// Un permiso
<ProtectedAction permission="...Create">
  <button>Crear</button>
</ProtectedAction>

// Múltiples permisos (OR)
<ProtectedAction permission={[perm1, perm2]}>
  <button>Crear O Editar</button>
</ProtectedAction>

// Múltiples permisos (AND)
<ProtectedAction permission={[perm1, perm2]} requireAll={true}>
  <button>Requiere ambos</button>
</ProtectedAction>

// Con fallback
<ProtectedAction permission="..." fallback={<p>No tienes acceso</p>}>
  <button>Crear</button>
</ProtectedAction>
```

---

#### `<ProtectedButton>`

Botón que se desactiva si no tienes permiso.

**Props**:
- `permission: string | string[]` - Permiso(s) a verificar
- `children: ReactNode` - Texto del botón
- `requireAll?: boolean` - AND (true) vs OR (false, default)
- `fallback?: ReactNode` - Botón alternativo si no tienes permiso
- `noPermissionTooltip?: string` - Tooltip cuando deshabilitado
- Todos los props HTML: `onClick`, `className`, `disabled`, etc.

**Ejemplos**:

```typescript
// Simple
<ProtectedButton
  permission={PERMS.MARCOS.CREATE}
  onClick={handleCreate}
  className="btn btn-primary"
>
  Crear
</ProtectedButton>

// Con tooltip
<ProtectedButton
  permission={PERMS.MARCOS.DELETE}
  onClick={handleDelete}
  noPermissionTooltip="Necesitas permiso de administrador"
>
  Eliminar
</ProtectedButton>

// Con fallback
<ProtectedButton
  permission={PERMS.MARCOS.UPDATE}
  fallback={<span className="text-gray-400">No puedes editar</span>}
>
  Editar
</ProtectedButton>
```

---

### Constantes de Permisos

**Ubicación**: `@/features/auth/constants.ts`

```typescript
import { PERMISSIONS } from '@/features/auth/constants';

// O importar específicos:
import { PERMISSIONS } from '@/features/auth/constants';

// Uso:
PERMISSIONS.QUALITAS.FOUNDATION.ORGANIZATIONS.VIEW
PERMISSIONS.QUALITAS.FOUNDATION.ORGANIZATIONS.CREATE
PERMISSIONS.QUALITAS.FOUNDATION.ORGANIZATIONS.UPDATE
PERMISSIONS.QUALITAS.FOUNDATION.ORGANIZATIONS.DELETE

PERMISSIONS.QUALITAS.FOUNDATION.ORGANIZATION_UNITS.VIEW
PERMISSIONS.QUALITAS.FOUNDATION.ORGANIZATION_UNITS.CREATE
PERMISSIONS.QUALITAS.FOUNDATION.ORGANIZATION_UNITS.UPDATE
PERMISSIONS.QUALITAS.FOUNDATION.ORGANIZATION_UNITS.DELETE

PERMISSIONS.QUALITAS.COMPLIANCE.MARCOS_NORMATIVOS.VIEW
PERMISSIONS.QUALITAS.COMPLIANCE.MARCOS_NORMATIVOS.CREATE
PERMISSIONS.QUALITAS.COMPLIANCE.MARCOS_NORMATIVOS.UPDATE
PERMISSIONS.QUALITAS.COMPLIANCE.MARCOS_NORMATIVOS.DELETE

PERMISSIONS.QUALITAS.COMPLIANCE.CLAUSULAS_REQUISITOS.VIEW
PERMISSIONS.QUALITAS.COMPLIANCE.CLAUSULAS_REQUISITOS.CREATE
PERMISSIONS.QUALITAS.COMPLIANCE.CLAUSULAS_REQUISITOS.UPDATE
PERMISSIONS.QUALITAS.COMPLIANCE.CLAUSULAS_REQUISITOS.DELETE

PERMISSIONS.QUALITAS.COMPLIANCE.CRITERIOS_CUMPLIMIENTO.VIEW
PERMISSIONS.QUALITAS.COMPLIANCE.CRITERIOS_CUMPLIMIENTO.CREATE
PERMISSIONS.QUALITAS.COMPLIANCE.CRITERIOS_CUMPLIMIENTO.UPDATE
PERMISSIONS.QUALITAS.COMPLIANCE.CRITERIOS_CUMPLIMIENTO.DELETE
```

---

## Mejores Prácticas

### ✅ DO (Sí)

1. **Usa constantes de permisos**
   ```typescript
   // ✅ Bueno - previene typos
   <ProtectedButton permission={PERMISSIONS.MARCOS.CREATE} />

   // ❌ Malo - riesgo de error
   <ProtectedButton permission="Permissions.Marcos.Create" />
   ```

2. **Verifica en frontend (UX)**
   ```typescript
   // ✅ Bueno - mejora UX
   const canCreate = useHasPermission(...);
   if (!canCreate) return <p>Permiso requerido</p>;
   ```

3. **Verifica TAMBIÉN en backend (Seguridad)**
   ```csharp
   // Backend - SIEMPRE verificar
   [HttpPost]
   [RequirePermission("Permissions.Marcos.Create")]
   public async Task<IActionResult> Create(...)
   {
     // Backend valida de nuevo
   }
   ```

4. **Usa ProtectedAction para código limpio**
   ```typescript
   // ✅ Limpio y legible
   <ProtectedAction permission={PERMS.MARCOS.CREATE}>
     <button>Crear</button>
   </ProtectedAction>
   ```

### ❌ DON'T (No)

1. **No hardcodees strings**
   ```typescript
   // ❌ Riesgo de typo
   useHasPermission('Permissions.QualitasCompliance.MarcosNormativs.Create')
   ```

2. **No confíes solo en frontend**
   ```typescript
   // ❌ Falso sentido de seguridad
   if (hasPermission) {
     // Usuario puede bypasear con DevTools
   }
   ```

3. **No hagas API calls sin verificar frontend**
   ```typescript
   // ❌ Desperdicia red
   createMarco().catch(() => console.error('No tienes permiso'))

   // ✅ Correcto
   if (!canCreate) return;
   createMarco().catch(...);
   ```

4. **No uses múltiples demostraciones confusas**
   ```typescript
   // ❌ Confuso - ¿cuál usar?
   <ProtectedButton permission="..." />
   <ProtectedAction permission="..." />
   <MyCustomPermissionCheck />

   // ✅ Usa los componentes estándar
   ```

---

## Troubleshooting

### Problema: Permisos Vacíos

**Síntomas**: `useHasPermission()` siempre retorna false

**Causas**:
1. Usuario no ha iniciado sesión
2. Endpoint de permisos retorna array vacío
3. Usuario no tiene roles asignados

**Solución**:
```javascript
// En consola del navegador
useAuthStore.getState().permissions
// Debe mostrar: ['Permissions.QualitasCompliance.MarcosNormativos.View', ...]

useAuthStore.getState().isAuthenticated
// Debe ser: true
```

---

### Problema: Botón Nunca Se Muestra

**Síntomas**: ProtectedButton siempre está deshabilitado

**Causas**:
1. String de permiso no coincide exactamente
2. Permiso no asignado al rol del usuario
3. Backend no sincronizado con frontend

**Solución**:
```javascript
// Verifica string exacto
const perms = useAuthStore.getState().permissions;
perms.includes('Permissions.QualitasCompliance.MarcosNormativos.Create')
// Debe ser: true

// Verifica roles del usuario
useAuthStore.getState().user.role
// Debe tener permiso asignado
```

---

### Problema: Permisos Perdidos al Recargar

**Síntomas**: Login funciona, pero recargo limpia permisos

**Causa**: sessionStorage se limpió (o navegador en privado)

**Solución**:
- sessionStorage persiste automáticamente
- Si se limpia, usuario debe volver a iniciar sesión

---

### Problema: ProtectedAction No Muestra Nada

**Síntomas**: Ni children ni fallback se muestran

**Causa**: Sin fallback, muestra nothing

**Solución**:
```typescript
// Siempre proporciona fallback si es crítico
<ProtectedAction
  permission="..."
  fallback={<p>Acceso denegado</p>}
>
  <button>Crear</button>
</ProtectedAction>
```

---

## Integración en Nuevas Interfaces

### Paso 1: Importar

```typescript
import { ProtectedButton } from '@/features/shared/components/ProtectedButton';
import { ProtectedAction } from '@/features/shared/components/ProtectedAction';
import { useHasPermission } from '@/features/auth/hooks/usePermission';
import { PERMISSIONS } from '@/features/auth/constants';
```

### Paso 2: Elegir Patrón

- **Simple**: Usa `<ProtectedButton>`
- **Control Total**: Usa `useHasPermission()` + lógica
- **Intermedio**: Usa `<ProtectedAction>`

### Paso 3: Reemplazar Hardcoded Permisos

```typescript
// Antes
if (user.role === 'admin') {
  return <button>Eliminar</button>;
}

// Después
<ProtectedButton permission={PERMISSIONS.MARCOS.DELETE}>
  Eliminar
</ProtectedButton>
```

---

## Demo Interactiva

Visita `/dashboard/demo-permissions` para ver todos los patrones funcionando.

---

**¿Preguntas?** Revisa la sección Troubleshooting arriba o contacta al equipo.
