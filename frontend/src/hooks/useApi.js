/**
 * useApi — wraps TanStack Query with automatic Bearer token injection.
 * Pages import query hooks from here instead of calling api.js directly.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../context/AuthContext'
import { jobs, workers, planning, warehouses, reports, settings, erp } from '../lib/api'

// Inject token into api.js by monkey-patching localStorage before calls.
// (api.js already reads from localStorage — no extra wiring needed.)

// ── Jobs ─────────────────────────────────────────────────────────────────────

export function useJobs(params) {
  return useQuery({
    queryKey: ['jobs', params],
    queryFn:  () => jobs.list(params),
    staleTime: 30_000,
  })
}

export function useJob(id) {
  return useQuery({
    queryKey: ['jobs', id],
    queryFn:  () => jobs.get(id),
    enabled:  !!id,
    staleTime: 15_000,
  })
}

export function useJobClockEvents(id) {
  return useQuery({
    queryKey: ['jobs', id, 'clock-events'],
    queryFn:  () => jobs.clockEvents(id),
    enabled:  !!id,
    staleTime: 10_000,
  })
}

export function useJobTally(id) {
  return useQuery({
    queryKey: ['jobs', id, 'tally'],
    queryFn:  () => jobs.tallyRecords(id),
    enabled:  !!id,
    staleTime: 30_000,
  })
}

export function useJobDispatch(id) {
  return useQuery({
    queryKey: ['jobs', id, 'dispatch'],
    queryFn:  () => jobs.dispatchNotes(id),
    enabled:  !!id,
    staleTime: 30_000,
  })
}

export function useCompletePhase(jobId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) => jobs.completePhase(jobId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['jobs'] }),
  })
}

export function useClockIn(jobId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) => jobs.clockIn(jobId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['jobs', jobId] })
      qc.invalidateQueries({ queryKey: ['workers'] })
    },
  })
}

export function useClockOut(jobId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (eventId) => jobs.clockOut(jobId, eventId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['jobs', jobId] })
      qc.invalidateQueries({ queryKey: ['workers'] })
    },
  })
}

// ── Workers ───────────────────────────────────────────────────────────────────

export function useWorkers(params) {
  return useQuery({
    queryKey: ['workers', params],
    queryFn:  () => workers.list(params),
    staleTime: 30_000,
  })
}

export function useFloorView(warehouseId) {
  return useQuery({
    queryKey: ['workers', 'floor', warehouseId],
    queryFn:  () => workers.floor(warehouseId),
    staleTime: 15_000,
    refetchInterval: 30_000, // auto-refresh floor view every 30s
  })
}

// ── Planning ─────────────────────────────────────────────────────────────────

export function usePlanning(params) {
  return useQuery({
    queryKey: ['planning', params],
    queryFn:  () => planning.list(params),
    staleTime: 60_000,
  })
}

// ── Warehouses ────────────────────────────────────────────────────────────────

export function useWarehouses() {
  return useQuery({
    queryKey: ['warehouses'],
    queryFn:  warehouses.list,
    staleTime: 5 * 60_000,
  })
}

// ── Reports ───────────────────────────────────────────────────────────────────

export function useReportKpi(params) {
  return useQuery({
    queryKey: ['reports', 'kpi', params],
    queryFn:  () => reports.kpi(params),
    staleTime: 60_000,
  })
}

export function useReportJobs(params) {
  return useQuery({
    queryKey: ['reports', 'jobs', params],
    queryFn:  () => reports.jobs(params),
    staleTime: 60_000,
  })
}

export function useReportLabor(params) {
  return useQuery({
    queryKey: ['reports', 'labor', params],
    queryFn:  () => reports.labor(params),
    staleTime: 60_000,
  })
}

// ── Settings ──────────────────────────────────────────────────────────────────

export function useUsers() {
  return useQuery({
    queryKey: ['settings', 'users'],
    queryFn:  settings.users.list,
    staleTime: 60_000,
  })
}

export function useJobTypeConfigs() {
  return useQuery({
    queryKey: ['settings', 'job-type-configs'],
    queryFn:  settings.jobTypeConfigs.list,
    staleTime: 5 * 60_000,
  })
}

export function useSystemConfig() {
  return useQuery({
    queryKey: ['settings', 'system-config'],
    queryFn:  settings.systemConfig.get,
    staleTime: 5 * 60_000,
  })
}
