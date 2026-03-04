// src/hooks/useProcesses.ts
import { useMemo } from "react";

// --- INTERFACES ORIGINALES ---
export interface ProcessType {
  id: string;
  organization_id: string;
  name: string;
  code: string;
  description: string | null;
  sort_order: number;
  created_at: string;
}

export interface Process {
  id: string;
  organization_id: string;
  process_type_id: string;
  code: string;
  name: string;
  objective: string | null;
  scope: string | null;
  leader_id: string | null;
  status: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Procedure {
  id: string;
  process_id: string;
  code: string;
  name: string;
  objective: string | null;
  version: string | null;
  effective_date: string | null;
  responsible_id: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface OrgMember {
  userId: string;
  fullName: string;
}

// --- DATOS MOCK ---
const MOCK_TYPES: ProcessType[] = [
  { id: "t1", organization_id: "org1", name: "Estratégico", code: "EST", description: null, sort_order: 0, created_at: "" },
  { id: "t2", organization_id: "org1", name: "Misional", code: "MIS", description: null, sort_order: 1, created_at: "" },
  { id: "t3", organization_id: "org1", name: "Apoyo", code: "APO", description: null, sort_order: 2, created_at: "" },
  { id: "t4", organization_id: "org1", name: "Evaluación", code: "EVA", description: null, sort_order: 3, created_at: "" },
];

const MOCK_PROCESSES: Process[] = [
  {
    id: "p1",
    organization_id: "org1",
    process_type_id: "t1",
    code: "DIR-01",
    name: "Direccionamiento Estratégico",
    objective: "Definir objetivos",
    scope: "Toda la empresa",
    leader_id: "u1",
    status: "activo",
    sort_order: 0,
    is_active: true,
    created_at: "",
    updated_at: ""
  },
  {
    id: "p2",
    organization_id: "org1",
    process_type_id: "t2",
    code: "OP-01",
    name: "Operaciones de Software",
    objective: "Entregar código",
    scope: "Área técnica",
    leader_id: "u1",
    status: "en_revision",
    sort_order: 0,
    is_active: true,
    created_at: "",
    updated_at: ""
  }
];

// --- HOOKS MOCK (Simulan el comportamiento de useQuery/useMutation) ---

export function useProcessTypes() {
  return { data: MOCK_TYPES, isLoading: false };
}

export function useProcesses() {
  return { data: MOCK_PROCESSES, isLoading: false };
}

export function useProcedures(processId: string | null) {
  const data: Procedure[] = processId ? [
    { 
        id: "proc1", process_id: processId, code: "PR-01", name: "Manual de Calidad", 
        objective: null, version: "1.0", effective_date: null, responsible_id: null, 
        is_active: true, sort_order: 0, created_at: "" 
    }
  ] : [];
  return { data, isLoading: false };
}

export function useProcessRequirements(processId: string | null) {
  return { data: [], isLoading: false };
}

export function useOrgMembers() {
  const data: OrgMember[] = [
    { userId: "u1", fullName: "Admin User" },
    { userId: "u2", fullName: "Juan Perez" }
  ];
  return { data, isLoading: false };
}

// --- MUTACIONES (Simuladas con console.log) ---

export function useInitProcessTypes() {
  return { mutate: () => console.log("Tipos inicializados mock"), isPending: false };
}

export function useSaveProcess() {
  return { 
    mutate: (values: any, options?: { onSuccess?: () => void }) => {
      console.log("Proceso guardado mock:", values);
      options?.onSuccess?.();
    }, 
    isPending: false 
  };
}

export function useDeleteProcess() {
  return { mutate: (id: string) => console.log("Eliminando:", id), isPending: false };
}

export function useSaveProcedure() {
  return { mutate: (val: any) => console.log("Proc guardado:", val), isPending: false };
}

// Busca esta función al final de tu archivo de MOCKS y reemplázala:

export function useDeleteProcedure() {
  // Añadimos "= {} as any" o tipamos el objeto para que TS no chille 
  // si el componente lo llama con el patrón de desestructuración.
  return { 
    mutate: ({ id, processId }: { id: string; processId: string }) => {
      console.log(`Eliminando procedimiento ${id} del proceso ${processId}`);
    }, 
    isPending: false 
  };
}