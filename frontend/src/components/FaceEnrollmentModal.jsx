/**
 * FaceEnrollmentModal — admin/supervisor enrolls a worker's face and sets their PIN.
 *
 * Props:
 *   open      boolean
 *   onClose   () => void
 *   worker    { id, name, employeeId }
 *   onUpdated () => void   — called after successful enroll/delete/pin
 */
import { useRef, useState, useEffect, useCallback } from 'react'
import { Camera, Trash2, Key, CheckCircle, Loader, AlertTriangle, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import Modal from './Modal'
import { face as faceApi } from '../lib/api'

export default function FaceEnrollmentModal({ open, onClose, worker, onUpdated }) {
  const videoRef  = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)

  const [faceStatus, setFaceStatus]     = useState(null)   // { enrolled, enrolledAt, pinSet }
  const [loadingStatus, setLoadingStatus] = useState(false)
  const [tab, setTab]                   = useState('face')  // 'face' | 'pin'

  // Face enrollment state
  const [cameraOn, setCameraOn]         = useState(false)
  const [cameraLoading, setCameraLoading] = useState(false)
  const [cameraError, setCameraError]   = useState(null)
  const [capturedBlob, setCapturedBlob] = useState(null)
  const [capturedUrl, setCapturedUrl]   = useState(null)
  const [enrolling, setEnrolling]       = useState(false)
  const [deleting, setDeleting]         = useState(false)

  // PIN state
  const [newPin, setNewPin]   = useState('')
  const [savingPin, setSavingPin] = useState(false)

  // ── Load face status ───────────────────────────────────────────────────────

  const loadStatus = useCallback(() => {
    if (!worker?.id) return
    setLoadingStatus(true)
    faceApi.getStatus(worker.id)
      .then(setFaceStatus)
      .catch(() => setFaceStatus(null))
      .finally(() => setLoadingStatus(false))
  }, [worker?.id])

  useEffect(() => {
    if (open) { loadStatus(); setTab('face'); setCapturedBlob(null); setCapturedUrl(null); setNewPin('') }
    else        { stopCamera() }
  }, [open, loadStatus])

  // ── Camera ─────────────────────────────────────────────────────────────────

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    setCameraOn(false)
    setCameraLoading(false)
  }, [])

  // Attach stream to video element whenever stream or video ref changes
  useEffect(() => {
    if (streamRef.current && videoRef.current && cameraOn) {
      videoRef.current.srcObject = streamRef.current
      videoRef.current.play().catch(() => {})
    }
  }, [cameraOn])

  async function startCamera() {
    setCameraError(null)
    setCameraLoading(true)
    try {
      // Try rear camera first (PDA), fall back to any camera (laptop)
      let stream
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 } },
          audio: false,
        })
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      }
      streamRef.current = stream
      setCameraOn(true)   // triggers useEffect above to attach stream to video
    } catch (err) {
      setCameraError(`Camera access denied: ${err.message ?? 'check browser permissions'}`)
    } finally {
      setCameraLoading(false)
    }
  }

  function capturePhoto() {
    if (!videoRef.current || !canvasRef.current) return
    const video = videoRef.current
    const canvas = canvasRef.current
    canvas.width  = video.videoWidth  || 640
    canvas.height = video.videoHeight || 480
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height)
    canvas.toBlob(blob => {
      if (!blob) return
      setCapturedBlob(blob)
      setCapturedUrl(URL.createObjectURL(blob))
      stopCamera()
    }, 'image/jpeg', 0.92)
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setCapturedBlob(file)
    setCapturedUrl(URL.createObjectURL(file))
    stopCamera()
  }

  // ── Enroll ─────────────────────────────────────────────────────────────────

  async function handleEnroll() {
    if (!capturedBlob) { toast.error('Capture or upload a photo first'); return }
    setEnrolling(true)
    try {
      const file = capturedBlob instanceof File ? capturedBlob : new File([capturedBlob], 'face.jpg', { type: 'image/jpeg' })
      await faceApi.enroll(worker.id, file)
      toast.success('Face enrolled successfully')
      setCapturedBlob(null); setCapturedUrl(null)
      loadStatus()
      onUpdated?.()
    } catch (err) {
      toast.error(err.message ?? 'Enrollment failed')
    } finally {
      setEnrolling(false)
    }
  }

  async function handleDelete() {
    if (!confirm(`Remove face enrollment for ${worker?.name}?`)) return
    setDeleting(true)
    try {
      await faceApi.deleteEnrollment(worker.id)
      toast.success('Face enrollment removed')
      loadStatus()
      onUpdated?.()
    } catch (err) {
      toast.error(err.message ?? 'Delete failed')
    } finally {
      setDeleting(false)
    }
  }

  // ── PIN ────────────────────────────────────────────────────────────────────

  async function handleSetPin(e) {
    e.preventDefault()
    if (newPin.length !== 4) { toast.error('PIN must be exactly 4 digits'); return }
    setSavingPin(true)
    try {
      await faceApi.setPin(worker.id, newPin)
      toast.success('PIN set successfully')
      setNewPin('')
      loadStatus()
      onUpdated?.()
    } catch (err) {
      toast.error(err.message ?? 'Failed to set PIN')
    } finally {
      setSavingPin(false)
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  if (!worker) return null

  return (
    <Modal open={open} onClose={onClose} title={`Face Setup — ${worker.name}`} size="md">
      <div className="space-y-4">

        {/* Status bar */}
        {loadingStatus ? (
          <div className="flex items-center gap-2 text-sm text-[#505D7B]">
            <Loader size={14} className="animate-spin" /> Loading status…
          </div>
        ) : faceStatus ? (
          <div className="flex items-center gap-3 text-sm p-3 rounded-lg bg-[#F2F8FA]">
            <div className={`flex items-center gap-1.5 font-medium ${faceStatus.enrolled ? 'text-[#2E7D32]' : 'text-[#505D7B]'}`}>
              {faceStatus.enrolled ? <CheckCircle size={14} /> : <AlertTriangle size={14} />}
              Face: {faceStatus.enrolled ? 'Enrolled' : 'Not enrolled'}
            </div>
            <span className="text-[#DDE8EC]">|</span>
            <div className={`flex items-center gap-1.5 font-medium ${faceStatus.hasPin ? 'text-[#2E7D32]' : 'text-[#505D7B]'}`}>
              <Key size={13} />
              PIN: {faceStatus.hasPin ? 'Set' : 'Not set'}
            </div>
          </div>
        ) : null}

        {/* Tab nav */}
        <div className="flex rounded-lg border border-[#DDE8EC] overflow-hidden">
          {[{ id: 'face', label: 'Face Photo', icon: Camera }, { id: 'pin', label: 'PIN Fallback', icon: Key }].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium transition-colors ${
                tab === t.id ? 'bg-[#07847F] text-white' : 'text-[#505D7B] hover:bg-gray-50'}`}>
              <t.icon size={14} /> {t.label}
            </button>
          ))}
        </div>

        {/* ── Face tab ── */}
        {tab === 'face' && (
          <div className="space-y-3">

            {/* Current enrollment status actions */}
            {faceStatus?.enrolled && !capturedUrl && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-[#E8F5E9] border border-[#A5D6A7]">
                <div className="text-sm text-[#2E7D32] font-medium flex items-center gap-2">
                  <CheckCircle size={15} />
                  Face enrolled
                  {faceStatus.enrolledAt && (
                    <span className="text-xs font-normal text-[#505D7B]">
                      — {new Date(faceStatus.enrolledAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <button onClick={handleDelete} disabled={deleting}
                  className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-[#C62828] bg-[#FFEBEE] rounded-lg hover:bg-red-100 disabled:opacity-60">
                  {deleting ? <Loader size={12} className="animate-spin" /> : <Trash2 size={12} />}
                  Remove
                </button>
              </div>
            )}

            {/* Camera / capture area */}

            {/* Captured preview */}
            {capturedUrl && (
              <div className="space-y-2">
                <div className="relative rounded-xl overflow-hidden" style={{ aspectRatio: '4/3' }}>
                  <img src={capturedUrl} alt="Captured" className="w-full h-full object-cover" />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setCapturedBlob(null); setCapturedUrl(null) }}
                    className="flex-1 py-2 border border-[#DDE8EC] rounded-lg text-sm text-[#505D7B] hover:bg-gray-50 flex items-center justify-center gap-1.5">
                    <RefreshCw size={13} /> Retake
                  </button>
                  <button onClick={handleEnroll} disabled={enrolling}
                    className="flex-1 py-2 bg-[#07847F] text-white font-semibold rounded-lg text-sm hover:bg-[#1C3F39] disabled:opacity-60 flex items-center justify-center gap-1.5">
                    {enrolling ? <><Loader size={13} className="animate-spin" /> Enrolling…</> : <><CheckCircle size={13} /> Enroll Face</>}
                  </button>
                </div>
              </div>
            )}

            {/* Video element — always in DOM so ref is available; shown when camera active */}
            <div style={{ display: (cameraOn || cameraLoading) && !capturedUrl ? 'block' : 'none' }}
              className="space-y-2">
              <div className="relative rounded-xl overflow-hidden bg-black" style={{ aspectRatio: '4/3' }}>
                <video ref={videoRef} playsInline muted className="w-full h-full object-cover" />
                <canvas ref={canvasRef} className="hidden" />
                {/* Face guide oval */}
                {cameraOn && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-44 h-52 border-2 border-white/60 rounded-full"
                      style={{ boxShadow: '0 0 0 9999px rgba(0,0,0,0.35)' }} />
                  </div>
                )}
                {/* Loading overlay */}
                {cameraLoading && (
                  <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
                    <div className="text-center text-white">
                      <Loader size={28} className="animate-spin mx-auto mb-2" />
                      <p className="text-sm">Starting camera…</p>
                    </div>
                  </div>
                )}
              </div>
              {cameraOn && (
                <div className="flex gap-2">
                  <button onClick={stopCamera}
                    className="flex-1 py-2 border border-[#DDE8EC] rounded-lg text-sm text-[#505D7B] hover:bg-gray-50">
                    Cancel
                  </button>
                  <button onClick={capturePhoto}
                    className="flex-1 py-2 bg-[#07847F] text-white font-semibold rounded-lg text-sm hover:bg-[#1C3F39] flex items-center justify-center gap-1.5">
                    <Camera size={14} /> Capture
                  </button>
                </div>
              )}
            </div>

            {/* Default state — buttons to start camera or upload */}
            {!capturedUrl && !cameraOn && !cameraLoading && (
              <div className="space-y-2">
                {cameraError && (
                  <div className="p-3 rounded-lg bg-[#FFF3E0] text-[#E65100] text-sm flex items-start gap-2">
                    <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                    {cameraError}
                  </div>
                )}
                <div className="flex gap-2">
                  <button onClick={startCamera}
                    className="flex-1 py-2.5 border-2 border-dashed border-[#07847F] text-[#07847F] rounded-xl text-sm font-medium hover:bg-[#E0F7FA] flex items-center justify-center gap-2">
                    <Camera size={15} /> Use Camera
                  </button>
                  <label className="flex-1 py-2.5 border-2 border-dashed border-[#DDE8EC] text-[#505D7B] rounded-xl text-sm font-medium hover:bg-gray-50 flex items-center justify-center gap-2 cursor-pointer">
                    Upload Photo
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                  </label>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── PIN tab ── */}
        {tab === 'pin' && (
          <form onSubmit={handleSetPin} className="space-y-4">
            <p className="text-sm text-[#505D7B]">
              Set a 4-digit PIN that the worker can use when face recognition is unavailable.
            </p>

            <div>
              <label className="block text-xs font-semibold text-[#505D7B] mb-1">
                New PIN (4 digits)
              </label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={newPin}
                onChange={e => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="••••"
                className="w-full px-3 py-3 border border-[#DDE8EC] rounded-lg text-2xl text-center tracking-[0.5em] font-mono focus:outline-none focus:border-[#07847F]"
              />
            </div>

            {faceStatus?.hasPin && (
              <div className="text-xs text-[#2E7D32] flex items-center gap-1.5">
                <CheckCircle size={12} /> PIN is currently set — submitting will replace it.
              </div>
            )}

            <button type="submit" disabled={savingPin || newPin.length !== 4}
              className="w-full py-2.5 bg-[#07847F] text-white font-semibold rounded-xl text-sm hover:bg-[#1C3F39] disabled:opacity-60 flex items-center justify-center gap-2">
              {savingPin ? <><Loader size={14} className="animate-spin" /> Saving…</> : <><Key size={14} /> Set PIN</>}
            </button>
          </form>
        )}
      </div>
    </Modal>
  )
}
