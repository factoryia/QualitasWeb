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

### TODO: reconciliar perspective string ↔ BscPerspective UUID

`DofaItemDto.perspective` is currently stored as a **free string** (e.g. `"Financiero"`),
matching the `BscPerspectiveDto.name`. The backend's `CreateDofaItemCommand` also expects
a string, not a UUID.

The clean architecture would store the `BscPerspective.id` (UUID) and join at query time.
This migration requires a **coordinated backend change** in:
- `Modules.Qualitas.Strategic.Contracts/DTOs/CreateDofaItemCommand.cs`
  → rename `perspective: string` → `bscPerspectiveId: Guid`
- The corresponding EF migration to add FK column

Until that change lands, `dofa-diagnostico.tsx` maps `BscPerspectiveDto.name` to the
`perspective` field so items continue to work. When the backend is updated, update
`CreateDofaItemCommand` in `feature/planning/api/dofa.ts` and the `submitAddItem`
handler in `dofa-diagnostico.tsx`.

### Backend gaps (not yet in OpenAPI spec)

| Gap | Impact |
|---|---|
| `GET /indicators/{id}/measurements` — no list endpoint | Measurements list view omitted; create/update/delete still work |
| `GET /dofa/{analysisId}/phase-progress` — no endpoint | Progress % on `dofa-list.tsx` is derived from status, not actual item counts |
| `POST /dofa/{analysisId}/items/bulk` — no bulk create | Users add items one at a time |
| `POST /dofa/{analysisId}/transition` — no workflow endpoint | Status transitions use the generic `PUT /dofa/{id}` with `status` field |
