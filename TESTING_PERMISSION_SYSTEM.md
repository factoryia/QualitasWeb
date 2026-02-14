# Permission System Testing Guide

**Date**: February 14, 2026
**Status**: ✅ Production Ready

## Overview

The permission system has been fully implemented, consolidated, and optimized. All components are properly integrated:

1. ✅ Auth store with permission state management (Zustand)
2. ✅ Permissions service fetching from backend
3. ✅ Auth service automatically fetching permissions after login
4. ✅ Custom hooks for permission checking (5 hooks)
5. ✅ UI components for permission-based rendering
6. ✅ Single consolidated guide + interactive demo
7. ✅ Hydration fixes for Next.js client components

## Quick Links

- **📚 Implementation Guide**: `PERMISSIONS_IMPLEMENTATION_GUIDE.md` - **START HERE** for all details
- **🎯 Interactive Demo**: `/dashboard/demo-permissions` - Live examples of all patterns
- **🧪 This Guide**: Testing and verification procedures

## System Architecture

### Backend Integration
- **Token Endpoint**: `POST /api/v1/identity/token/issue` (returns `accessToken`, `refreshToken`)
- **Permissions Endpoint**: `GET /api/v1/identity/users/permissions` (returns `string[]` of permissions)
- **Base URL**: `http://localhost:5030` (configured in `.env.local`)
- **Tenant Header**: `root` (set in env or requests)
- **Permission Format**: `"Permissions.{Module}.{Entity}.{Action}"` (e.g., `"Permissions.QualitasCompliance.MarcosNormativos.Create"`)

### Frontend Flow
```
Login Page → Enter Credentials
    ↓
Login Form → Call authService.login()
    ↓
Backend Issues JWT Token
    ↓
Auth Store Saves Token
    ↓
Permission Service Fetches Permissions (with Bearer token)
    ↓
Auth Store Saves Permissions Array
    ↓
Dashboard Layout Mounts (Protected by AuthGuard)
    ↓
Components Access Permissions via useHasPermission Hook
```

## Testing Instructions

### Step 1: Start Backend
Ensure the backend is running on port 5030:
```bash
cd /Users/leandroagudelo/proyectos/FACTORY/QualitasNexus
dotnet run --project src/Playground/Playground.Api/Playground.Api.csproj
```

Expected: Backend starts on `http://localhost:5030`

### Step 2: Start Frontend
In a new terminal:
```bash
cd /Users/leandroagudelo/proyectos/FACTORY/QualitasWeb
npm run dev
```

Expected: Frontend starts on `http://localhost:3000`

### Step 3: Login Test

1. Navigate to: `http://localhost:3000/login`
2. Enter test credentials:
   - **Email**: admin@example.com
   - **Password**: Admin123! (or whatever test password is configured)
   - **Tenant**: root

3. Click "Login"

**Expected Results**:
- ✅ Page redirects to `/dashboard`
- ✅ Welcome message shows user name
- ✅ User email displays
- ✅ Browser console shows no errors
- ✅ Browser localStorage contains `auth-storage` key with:
  - `accessToken` (JWT)
  - `refreshToken`
  - `user` object
  - `permissions` array with ~29 items

### Step 4: Test Protected Dashboard Layout

1. Navigate to: `http://localhost:3000/dashboard`
2. Verify the layout renders:
   - Sidebar with "Qualitas Nexus" logo
   - Welcome header with user name
   - Logout button
   - Tenant info showing "root"

**Expected Results**:
- ✅ Dashboard layout displays properly
- ✅ No blank/loading screens
- ✅ User info from JWT decoded correctly
- ✅ Sidebar navigation visible (desktop)

### Step 5: Test Permission System - Interactive Demo (NEW)

1. Navigate to: `http://localhost:3000/dashboard/demo-permissions`
2. Verify the interactive demo loads with 4 tabs:
   - **📊 Overview Tab**: Your info + permissions + access summary
   - **🪝 Hooks Tab**: Live examples of useHasPermission, useHasAnyPermission, useHasAllPermissions, usePermissions
   - **🧩 Components Tab**: ProtectedButton and ProtectedAction examples
   - **📐 Patterns Tab**: Real-world patterns (table actions, conditional fields, etc.)

**Expected Results**:
- ✅ Page renders successfully without redirects
- ✅ User info matches login credentials (email, name, role, tenant)
- ✅ All permissions display in overview (~29 items)
- ✅ Hook examples show "true ✅" or "false ❌" based on your permissions
- ✅ Component examples are interactive and respond to your permissions
- ✅ All 4 tabs switch smoothly
- ✅ Links to implementation guide work

**Testing Each Tab**:

**Tab 1 - Overview**:
```
✓ Shows your email and name
✓ Shows your role (Admin, Manager, etc.)
✓ Shows tenant (root)
✓ Lists all permissions with green boxes
✓ Shows access summary (✅/❌ for each module)
```

**Tab 2 - Hooks**:
```
✓ useHasPermission shows result (true/false)
✓ useHasAnyPermission shows OR logic result
✓ useHasAllPermissions shows AND logic result
✓ usePermissions shows total count
```

**Tab 3 - Components**:
```
✓ ProtectedButton examples are clickable
✓ Some buttons are enabled (green) for your permissions
✓ Some buttons are disabled (gray) if no permission
✓ ProtectedAction shows content if you have permission
✓ ProtectedAction shows fallback if you don't
```

**Tab 4 - Patterns**:
```
✓ Table example shows edit/delete buttons
✓ Buttons are enabled/disabled based on your permissions
✓ Clicking buttons shows alert (just demo)
```

### Step 7: Test Permission Hooks (Manual Console Test)

In browser DevTools console while logged in:

```javascript
// Test 1: Access the store directly
const authStore = require('@/features/auth/store/auth.store');
const store = authStore.useAuthStore.getState();
console.log('User:', store.user);
console.log('Permissions:', store.permissions);
console.log('Is Authenticated:', store.isAuthenticated);

// Test 2: Check specific permission
const hasCreate = store.permissions.includes('Permissions.QualitasCompliance.MarcosNormativos.Create');
console.log('Has Create Permission:', hasCreate);
```

**Expected Results**:
- User object displays correctly
- Permissions array contains strings like "Permissions.QualitasCompliance.MarcosNormativos.View"
- isAuthenticated is `true`
- Specific permission check returns `true` for admin user

## Code Examples

**📚 For complete examples and detailed explanation of all 7 patterns, see: `PERMISSIONS_IMPLEMENTATION_GUIDE.md`**

### Quick Example 1: Using ProtectedButton (Simplest)

```typescript
import { ProtectedButton } from '@/features/shared/components/ProtectedButton';
import { PERMISSIONS } from '@/features/auth/constants';

export function MarcosActions() {
  return (
    <ProtectedButton
      permission={PERMISSIONS.QUALITAS.COMPLIANCE.MARCOS_NORMATIVOS.CREATE}
      onClick={handleCreate}
      className="btn btn-primary"
    >
      Create Marco
    </ProtectedButton>
  );
}
```

### Quick Example 2: Using useHasPermission Hook (More Control)

```typescript
import { useHasPermission } from '@/features/auth/hooks/usePermission';
import { PERMISSIONS } from '@/features/auth/constants';

export function MarcosActions() {
  const canCreate = useHasPermission(
    PERMISSIONS.QUALITAS.COMPLIANCE.MARCOS_NORMATIVOS.CREATE
  );

  if (!canCreate) {
    return <p>No permission to create</p>;
  }

  return <button onClick={handleCreate}>Create Marco</button>;
}
```

### Quick Example 3: Using ProtectedAction (Clean JSX)

```typescript
import { ProtectedAction } from '@/features/shared/components/ProtectedAction';
import { PERMISSIONS } from '@/features/auth/constants';

export function MarcosActions() {
  return (
    <ProtectedAction
      permission={PERMISSIONS.QUALITAS.COMPLIANCE.MARCOS_NORMATIVOS.DELETE}
      fallback={<p className="text-gray-400">No delete permission</p>}
    >
      <button className="btn btn-danger">Delete Marco</button>
    </ProtectedAction>
  );
}
```

**See `PERMISSIONS_IMPLEMENTATION_GUIDE.md` for 4 more patterns and complete reference.**

## Troubleshooting

### Issue: "No authenticated user" message on demo pages

**Cause**: User is not logged in or session expired

**Solution**:
1. Navigate to `/login`
2. Enter correct credentials
3. Navigate back to dashboard demo page
4. Check browser console for auth errors

### Issue: Permissions list is empty

**Cause**: Backend permissions endpoint failing or auth token not included

**Solution**:
1. Check browser console for 401/403 errors
2. Verify backend is running and accessible
3. Check Network tab: `GET /api/v1/identity/permissions` should return array
4. Verify `Authorization: Bearer {token}` header is present

### Issue: Hydration mismatch warning in console

**Cause**: Component reading from store before hydration complete (rare after fix)

**Solution**:
1. Clear browser cache: DevTools → Storage → Clear Site Data
2. Clear localStorage: `localStorage.clear()` in console
3. Reload page

### Issue: Blank page in dashboard layout

**Cause**: Rare race condition during authentication check

**Solution**:
1. Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
2. Check Network tab for failed requests
3. Check browser console for JavaScript errors
4. Verify backend is responding to requests

## Files Modified

### Core System Files
1. **auth.store.ts** - Added permissions state management
2. **auth.service.ts** - Integrated permission fetching
3. **auth-guard.tsx** - Fixed hydration issues
4. **(dashboard)/layout.tsx** - Added hydration state management

### New Services
1. **permissions.service.ts** - Backend integration
2. **users.service.ts** - User CRUD operations

### New Hooks
1. **usePermission.ts** - 5 custom permission hooks

### New Components
1. **ProtectedButton.tsx** - Permission-aware button
2. **ProtectedAction.tsx** - Permission-aware content wrapper

### Demo Pages
1. **app/(dashboard)/demo-permissions/page.tsx** - ✅ NEW interactive demo with 4 tabs (consolidates old pages)
   - Replaces: demo-permisos, demo-simple, test-permissions, usuarios-demo

### Documentation
1. **PERMISSIONS_IMPLEMENTATION_GUIDE.md** - ✅ NEW consolidated guide (16 KB)
   - Consolidates: PERMISSIONS_USAGE_GUIDE.md, RESUMEN_IMPLEMENTACION_PERMISOS.md, GUIA_INTEGRACION_PERMISOS.md
   - Contains: 7 patterns, all hooks/components reference, best practices, troubleshooting
2. **TESTING_PERMISSION_SYSTEM.md** - This file (testing procedures)
3. **SECURITY_AND_QUALITY_AUDIT.md** - Security audit report (all 11 issues fixed)

## Environment Configuration

**File**: `.env.local`
```
NEXT_PUBLIC_BACKEND_API_BASE_URL=http://localhost:5030
NEXT_PUBLIC_BACKEND_TENANT=root
```

Verify these are set correctly before testing.

---

## Summary of Changes (Feb 14, 2026)

### ✅ New Files Created
1. **PERMISSIONS_IMPLEMENTATION_GUIDE.md** - Consolidated reference guide (16 KB)
   - 7 patterns with full examples
   - Complete API documentation
   - Best practices and troubleshooting

2. **app/(dashboard)/demo-permissions/page.tsx** - Interactive demo with 4 tabs
   - Overview: User info + permissions summary
   - Hooks: Live examples of 5 hooks
   - Components: ProtectedButton & ProtectedAction examples
   - Patterns: Real-world use cases

### ✅ Files Removed (Consolidated)
- PERMISSIONS_USAGE_GUIDE.md (→ PERMISSIONS_IMPLEMENTATION_GUIDE.md)
- RESUMEN_IMPLEMENTACION_PERMISOS.md (→ PERMISSIONS_IMPLEMENTATION_GUIDE.md)
- GUIA_INTEGRACION_PERMISOS.md (→ PERMISSIONS_IMPLEMENTATION_GUIDE.md)
- /demo-permisos (→ /dashboard/demo-permissions)
- /demo-simple (→ /dashboard/demo-permissions)

### ✅ This Guide Updated
- Updated all references to new guide and demo page
- Added proper endpoint documentation
- Added API integration examples
- Simplified code examples with references to main guide

---

## Next Steps

### For Developers Using the System
1. Read: `PERMISSIONS_IMPLEMENTATION_GUIDE.md` (start here)
2. Visit: `/dashboard/demo-permissions` (see live examples)
3. Implement using one of the 7 patterns
4. Test using this guide

### For QA/Testing
1. Follow the testing steps above
2. Test all 4 tabs in `/dashboard/demo-permissions`
3. Verify console errors (should be none)
4. Test with different user roles if available

### For Backend Integration
1. Ensure `/api/v1/identity/users/permissions` endpoint returns `string[]`
2. Ensure `.RequirePermission()` is used on all endpoints
3. Ensure Finbuckle multi-tenancy is configured correctly
4. See: `QualitasNexus/BACKEND_SECURITY_CHECKLIST.md`

## API Integration (For Manual Testing)

### 1. Login (Get JWT Token)
```bash
curl -X POST "http://localhost:5030/api/v1/identity/token/issue" \
  -H "tenant: root" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "Admin123!"
  }'
```

**Expected Response**:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshTokenExpiresAt": "2026-02-21T15:17:37.000Z",
  "accessTokenExpiresAt": "2026-02-14T16:17:37.000Z"
}
```

### 2. Get User Permissions
```bash
curl -X GET "http://localhost:5030/api/v1/identity/users/permissions" \
  -H "Authorization: Bearer <JWT_TOKEN_FROM_ABOVE>" \
  -H "tenant: root"
```

**Expected Response**:
```json
[
  "Permissions.QualitasFoundation.Organizations.View",
  "Permissions.QualitasFoundation.Organizations.Create",
  "Permissions.QualitasCompliance.MarcosNormativos.View",
  "Permissions.QualitasCompliance.MarcosNormativos.Create",
  ...
]
```

### 3. Test Permission-Protected Backend Endpoint
```bash
# This should work (user has permission)
curl -X GET "http://localhost:5030/api/v1/qualitas/foundation/organizations" \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "tenant: root"

# Expected: 200 OK with organizations list

# This should fail (user doesn't have this specific permission)
curl -X DELETE "http://localhost:5030/api/v1/qualitas/foundation/organizations/123" \
  -H "Authorization: Bearer <JWT_TOKEN_WITHOUT_DELETE_PERM>" \
  -H "tenant: root"

# Expected: 403 Forbidden
```

