/**
 * Central API client for NLC Job Card System.
 * Reads the JWT from localStorage (nlc_auth), injects Authorization header.
 * On 401, attempts token refresh once, then redirects to /login.
 */

// Empty string = same-origin (nginx proxy). Falls back to local dev backend.
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

function getAuth() {
  try {
    return JSON.parse(localStorage.getItem('nlc_auth') ?? 'null')
  } catch {
    return null
  }
}

function setAuth(data) {
  localStorage.setItem('nlc_auth', JSON.stringify(data))
}

function clearAuth() {
  localStorage.removeItem('nlc_auth')
}

let _refreshPromise = null

async function refreshTokens() {
  if (_refreshPromise) return _refreshPromise
  _refreshPromise = (async () => {
    const auth = getAuth()
    if (!auth?.refreshToken) throw new Error('No refresh token')
    const res = await fetch(`${BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: auth.refreshToken }),
    })
    if (!res.ok) throw new Error('Refresh failed')
    const data = await res.json()
    setAuth({ ...auth, accessToken: data.accessToken, refreshToken: data.refreshToken, expiresAt: data.expiresAt })
    return data.accessToken
  })().finally(() => { _refreshPromise = null })
  return _refreshPromise
}

async function request(path, options = {}, _retry = true) {
  const auth    = getAuth()
  const headers = { 'Content-Type': 'application/json', ...(options.headers ?? {}) }
  if (auth?.accessToken) headers['Authorization'] = `Bearer ${auth.accessToken}`

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers })

  if (res.status === 401 && _retry) {
    try {
      await refreshTokens()
      return request(path, options, false)
    } catch {
      clearAuth()
      window.location.href = '/login'
      throw new Error('Session expired')
    }
  }

  if (!res.ok) {
    const body = await res.text()
    let message = `HTTP ${res.status}`
    try { message = JSON.parse(body)?.message ?? message } catch { message = body || message }
    throw new Error(message)
  }

  const text = await res.text()
  return text ? JSON.parse(text) : null
}

// ── Auth ─────────────────────────────────────────────────────────────────────

export const auth = {
  login:   (email, password) =>
    request('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  logout:  (refreshToken) =>
    request('/api/auth/logout', { method: 'POST', body: JSON.stringify({ refreshToken }) }),
  refresh: (refreshToken) =>
    request('/api/auth/refresh', { method: 'POST', body: JSON.stringify({ refreshToken }) }),
}

// ── Jobs ─────────────────────────────────────────────────────────────────────

export const jobs = {
  list:        (params = {}) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v != null && v !== ''))
    ).toString()
    return request(`/api/jobs${qs ? `?${qs}` : ''}`)
  },
  get:         (id) => request(`/api/jobs/${id}`),
  create:      (data) => request('/api/jobs', { method: 'POST', body: JSON.stringify(data) }),
  update:      (id, data) => request(`/api/jobs/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  completePhase: (id, data) =>
    request(`/api/jobs/${id}/complete-phase`, { method: 'POST', body: JSON.stringify(data) }),
  skipPhase:   (id, data) =>
    request(`/api/jobs/${id}/skip-phase`, { method: 'POST', body: JSON.stringify(data) }),
  reactivate:  (id, data) =>
    request(`/api/jobs/${id}/reactivate`, { method: 'POST', body: JSON.stringify(data) }),
  clockIn:     (id, data) =>
    request(`/api/jobs/${id}/clock-in`, { method: 'POST', body: JSON.stringify(data) }),
  clockOut:    (id, eventId) =>
    request(`/api/jobs/${id}/clock-out/${eventId}`, { method: 'POST' }),
  clockEvents: (id) => request(`/api/jobs/${id}/clock-events`),
  tallyRecords:(id) => request(`/api/jobs/${id}/tally`),
  dispatchNotes:(id) => request(`/api/jobs/${id}/dispatch-notes`),
}

// ── Workers ──────────────────────────────────────────────────────────────────

export const workers = {
  list:   (params = {}) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v != null && v !== ''))
    ).toString()
    return request(`/api/workers${qs ? `?${qs}` : ''}`)
  },
  get:    (id) => request(`/api/workers/${id}`),
  create: (data) => request('/api/workers', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/api/workers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  toggle: (id) => request(`/api/workers/${id}/toggle`, { method: 'PATCH' }),
  floor:  (warehouseId) =>
    request(`/api/workers/floor${warehouseId ? `?warehouseId=${warehouseId}` : ''}`),
}

// ── Planning ──────────────────────────────────────────────────────────────────

export const planning = {
  list:   (params = {}) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v != null && v !== ''))
    ).toString()
    return request(`/api/planning${qs ? `?${qs}` : ''}`)
  },
  get:    (id) => request(`/api/planning/${id}`),
  create: (data) => request('/api/planning', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/api/planning/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/api/planning/${id}`, { method: 'DELETE' }),
  sync:   () => request('/api/planning/sync', { method: 'POST' }),
  createJob: (id) => request(`/api/planning/${id}/create-job`, { method: 'POST' }),
}

// ── Warehouses ────────────────────────────────────────────────────────────────

export const warehouses = {
  list:   () => request('/api/warehouses'),
  create: (data) => request('/api/warehouses', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/api/warehouses/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  toggle: (id) => request(`/api/warehouses/${id}/toggle`, { method: 'PATCH' }),
}

// ── Reports ───────────────────────────────────────────────────────────────────

export const reports = {
  kpi:        (params = {}) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v != null && v !== ''))
    ).toString()
    return request(`/api/reports/kpi${qs ? `?${qs}` : ''}`)
  },
  jobs:       (params = {}) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v != null && v !== ''))
    ).toString()
    return request(`/api/reports/jobs${qs ? `?${qs}` : ''}`)
  },
  labor:      (params = {}) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v != null && v !== ''))
    ).toString()
    return request(`/api/reports/labor${qs ? `?${qs}` : ''}`)
  },
  warehouse:  (params = {}) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v != null && v !== ''))
    ).toString()
    return request(`/api/reports/warehouse${qs ? `?${qs}` : ''}`)
  },
}

// ── Settings ──────────────────────────────────────────────────────────────────

export const settings = {
  users:          {
    list:   () => request('/api/auth/users'),
    create: (data) => request('/api/auth/users', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/api/auth/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    remove: (id) => request(`/api/auth/users/${id}`, { method: 'DELETE' }),
  },
  jobTypeConfigs: {
    list:   () => request('/api/settings/job-type-configs'),
    update: (id, data) => request(`/api/settings/job-type-configs/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  },
  systemConfig:   {
    get:    () => request('/api/settings/system-config'),
    update: (data) => request('/api/settings/system-config', { method: 'PUT', body: JSON.stringify(data) }),
  },
}

// ── Face Recognition ─────────────────────────────────────────────────────────

export const face = {
  /** GET /api/workers/{id}/face-status */
  getStatus: (workerId) =>
    request(`/api/workers/${workerId}/face-status`),

  /** POST /api/workers/{id}/face — multipart photo upload */
  enroll: (workerId, photoFile) => {
    const auth = getAuth()
    const formData = new FormData()
    formData.append('photo', photoFile)
    return fetch(`${BASE_URL}/api/workers/${workerId}/face`, {
      method: 'POST',
      headers: auth?.accessToken ? { Authorization: `Bearer ${auth.accessToken}` } : {},
      body: formData,
    }).then(async res => {
      if (!res.ok) {
        const text = await res.text()
        let message = `HTTP ${res.status}`
        try { message = JSON.parse(text)?.error ?? message } catch { message = text || message }
        throw new Error(message)
      }
      return res.json()
    })
  },

  /** DELETE /api/workers/{id}/face */
  deleteEnrollment: (workerId) =>
    request(`/api/workers/${workerId}/face`, { method: 'DELETE' }),

  /** POST /api/workers/{id}/face-pin */
  setPin: (workerId, pin) =>
    request(`/api/workers/${workerId}/face-pin`, { method: 'POST', body: JSON.stringify({ pin }) }),

  /** POST /api/jobs/{jobId}/face-clock — multipart image + phaseName */
  clockByFace: (jobId, imageBlob, phaseName) => {
    const auth = getAuth()
    const formData = new FormData()
    formData.append('image', imageBlob, 'face.jpg')
    formData.append('phaseName', phaseName)
    return fetch(`${BASE_URL}/api/jobs/${jobId}/face-clock`, {
      method: 'POST',
      headers: auth?.accessToken ? { Authorization: `Bearer ${auth.accessToken}` } : {},
      body: formData,
    }).then(async res => {
      const text = await res.text()
      const json = text ? JSON.parse(text) : null
      if (!res.ok) throw new Error(json?.message ?? `HTTP ${res.status}`)
      return json
    })
  },

  /** POST /api/jobs/{jobId}/face-clock/pin */
  clockByPin: (jobId, workerId, pin, phaseName) =>
    request(`/api/jobs/${jobId}/face-clock/pin`, {
      method: 'POST',
      body: JSON.stringify({ workerId, pin, phaseName }),
    }),
}

// ── ERP ───────────────────────────────────────────────────────────────────────

export const erp = {
  test:           () => request('/api/erp/test', { method: 'POST' }),
  push:           (jobId) => request(`/api/erp/push/${jobId}`, { method: 'POST' }),
  pull:           (jobId) => request(`/api/erp/tally/${jobId}`),
  syncPlanning:   () => request('/api/erp/planning'),
  simulateTally:  (jobId) => request(`/api/webhooks/tally-complete/${jobId}`, { method: 'POST' }),
}

export default { auth, jobs, workers, planning, warehouses, reports, settings, erp, face }
