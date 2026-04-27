# DOFA / Análisis Estratégico

## What it does

Implements the full DOFA (Fortalezas / Debilidades / Oportunidades / Amenazas) strategic analysis
module across three phases:

| Phase | Component | Status |
|---|---|---|
| Fase 1 — Diagnóstico | `dofa-diagnostico.tsx` | ✅ Functional |
| Fase 2 — Estrategia | `estrategia-list.tsx` | 🔜 Sprint 2 placeholder |
| Fase 3 — Plan | `plan-section.tsx`, `goals-section.tsx` | 🔜 Sprint 3 placeholder |

## Entry point

`analisis-dofa.tsx` (`AnalisisDofa`) is the root component used by
`app/(dashboard)/planificacion/analisis-dofa/page.tsx`. It:
1. Resolves the current tenant's `Organization` via `useOrganizationsQuery`.
2. Renders `DofaList` — a filterable list of analyses for that org.
3. On selection, renders `DofaDetail` — tabs wrapper with status workflow
   (`draft → in_review → approved`).

## Endpoints consumed

| Resource | Endpoints | Hook |
|---|---|---|
| DOFA analyses | GET/POST `/dofa`, GET/PUT/DELETE `/dofa/{id}` | `useDofaAnalysesQuery`, `useDofaAnalysisQuery`, `useDofaCreateAnalysisMutation`, `useDofaUpdateAnalysisMutation`, `useDofaDeleteAnalysisMutation` |
| DOFA items | GET (via analysis), POST/PUT/DELETE `/dofa/{id}/items/{itemId}` | `useDofaCreateItemMutation`, `useDofaUpdateItemMutation`, `useDofaDeactivateItemMutation` |
| BSC Perspectives | GET/POST `/bsc-perspectives`, PUT/DELETE `/bsc-perspectives/{id}` | `useBscPerspectivesQuery`, `useBscPerspective*Mutation` |
| Strategies | GET/POST `/strategies`, PUT/DELETE `/strategies/{id}`, dofa-item links, objective links | `useStrategies*`, `useLinkDofaItem*`, `useLinkObjective*` |
| Objectives | GET/POST `/objectives`, PUT/DELETE `/objectives/{id}` | `useObjective*Query/Mutation` |
| Goals | GET/POST `/goals`, PUT `/goals/{id}` | `useGoal*Query/Mutation` |
| Indicators | GET/POST/PUT/DELETE `/goals/{goalId}/indicators/{id}` | `useIndicator*Query/Mutation` |
| Measurements | POST/PUT/DELETE `/indicators/{indicatorId}/measurements/{id}` | `useMeasurement*Mutation` |
| Stakeholder–DOFA links | GET/POST `/stakeholder-dofa-links`, PUT/DELETE `/{id}` | `useStakeholderDofaLink*Query/Mutation` |
| Strategy types | GET `/strategy-types` | `useStrategyTypesQuery` |

All hooks live in `feature/planning/hooks/use-dofa.ts`.
All API functions live in `feature/planning/api/dofa.ts`.

## How to test locally

```bash
npm run dev
# Navigate to /planificacion/analisis-dofa
# 1. Create a new DOFA analysis
# 2. In Fase 1: add items per perspective and category
# 3. Toggle "Gestionar perspectivas BSC" to CRUD the BSC catalogue
# 4. Use "Enviar a revisión" and "Aprobar" to test the status workflow
```

---

## Known tech debt

### ✅ RESOLVED (2026-04-27): reconciliar perspective string ↔ BscPerspective UUID

The backend `CreateDofaItemRequest` and `UpdateDofaItemRequest` now require
`bscPerspectiveId` (UUID) instead of a free `perspective` string.

**Applied in commit `fix(planning/dofa): resolve BscPerspectiveId from catalog`:**
- `CreateDofaItemCommand` and `UpdateDofaItemCommand` in `api/dofa.ts` now use
  `bscPerspectiveId: string` (removed `perspective`, `priority`, `impactLevel`).
- `DofaItemDto` gained `bscPerspectiveId?: string` (optional, since GET response
  may still return `perspective` for compat — both are accepted).
- `handleAdd` in `dofa-diagnostico.tsx` resolves the UUID by matching
  `bscPerspectives.find(p => p.name === perspKey)?.id`.
- `handleUpdate` prioritises `item.bscPerspectiveId` (direct from response) and
  falls back to name-based lookup — gracefully handles either backend response shape.

### Backend gaps (not yet in OpenAPI spec)

| Gap | Impact |
|---|---|
| `GET /indicators/{id}/measurements` — no list endpoint | Measurements list view omitted; create/update/delete still work |
| `GET /dofa/{analysisId}/phase-progress` — no endpoint | Progress % on `dofa-list.tsx` is derived from status, not actual item counts |
| `POST /dofa/{analysisId}/items/bulk` — no bulk create | Users add items one at a time |
| `POST /dofa/{analysisId}/transition` — no workflow endpoint | Status transitions use the generic `PUT /dofa/{id}` with `status` field |
