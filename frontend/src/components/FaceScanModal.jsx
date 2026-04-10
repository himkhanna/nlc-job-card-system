/**
 * FaceScanModal — supervisor-facing camera UI for face clock-in/out on a job.
 *
 * Flow:
 *   1. Show camera preview (getUserMedia).
 *   2. Supervisor positions worker's face and taps "Scan".
 *   3. Captures a JPEG frame, POSTs to /api/jobs/{jobId}/face-clock.
 *   4. On low confidence / no face → shows retry.
 *   5. On FALLBACK_PIN status → switches to PIN entry panel.
 *   6. On CLOCKED_IN / CLOCKED_OUT → calls onSuccess(result) and closes.
 *
 * Props:
 *   open        boolean
 *   onClose     () => void
 *   jobId       string (UUID)
 *   phaseName   string
 *   onSuccess   (result: FaceClockResponse) => void
 */
import { useRef, useState, useEffect, useCallback } from 'react'
import { Camera, RefreshCw, X, Keyboard, UserCheck, AlertTriangle, Loader } from 'lucide-react'
import toast from 'react-hot-toast'
import Modal from './Modal'
import { face, workers as workersApi } from '../lib/api'

const STATUS_MESSAGES = {
  CLOCKED_IN:   { color: '#2E7D32', bg: '#E8F5E9', label: 'Clocked In'  },
  CLOCKED_OUT:  { color: '#07847F', bg: '#E0F7FA', label: 'Clocked Out' },
  NO_FACE:      { color: '#C62828', bg: '#FFEBEE', label: 'No Face Detected' },
  LOW_CONFIDENCE: { color: '#E65100', bg: '#FFF3E0', label: 'Low Confidence' },
  NO_MATCH:     { color: '#C62828', bg: '#FFEBEE', label: 'No Match Found' },
  CONFLICT:     { color: '#C62828', bg: '#FFEBEE', label: 'Conflict' },
  FALLBACK_PIN: { color: '#505D7B', bg: '#F2F8FA', label: 'Use PIN Fallback' },
}

export default function FaceScanModal({ open, onClose, jobId, phaseName, onSuccess }) {
  const videoRef      = useRef(null)
  const canvasRef     = useRef(null)
  const streamRef     = useRef(null)

  const [mode, setMode]         = useState('camera')   // 'camera' | 'pin'
  const [scanning, setScanning] = useState(false)
  const [cameraReady, setCameraReady] = useState(false)
  const [result, setResult]     = useState(null)        // last FaceClockResponse
  const [cameraError, setCameraError] = useState(null)

  // PIN state
  const [workerList, setWorkerList]   = useState([])
  const [selectedWorker, setSelectedWorker] = useState('')
  const [pin, setPin]                 = useState('')
  const [submittingPin, setSubmittingPin]   = useState(false)

  // ── Camera lifecycle ───────────────────────────────────────────────────────

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    setCameraReady(false)
  }, [])

  const startCamera = useCallback(async () => {
    setCameraError(null)
    setCameraReady(false)
    try {
      let stream
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        })
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      }
      streamRef.current = stream
      setCameraReady(true)  // triggers useEffect below to attach to video element
    } catch (err) {
      setCameraError(`Camera access denied: ${err.message ?? 'check browser permissions'}`)
    }
  }, [])

  // Attach stream once video element is in the DOM (cameraReady + mode = camera)
  useEffect(() => {
    if (cameraReady && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current
      videoRef.current.play().catch(() => {})
    }
  }, [cameraReady, mode])

  useEffect(() => {
    if (!open) { stopCamera(); setResult(null); setMode('camera'); setPin(''); setSelectedWorker('') }
    else        { startCamera() }
    return stopCamera
  }, [open, startCamera, stopCamera])

  // Load worker list for PIN fallback
  useEffect(() => {
    if (!open) return
    workersApi.list().then(data => setWorkerList(Array.isArray(data) ? data : data?.content ?? [])).catch(() => {})
  }, [open])

  // ── Face scan ──────────────────────────────────────────────────────────────

  async function handleScan() {
    if (!videoRef.current || !canvasRef.current) return
    setScanning(true)
    setResult(null)

    const video  = videoRef.current
    const canvas = canvasRef.current
    canvas.width  = video.videoWidth  || 640
    canvas.height = video.videoHeight || 480
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height)

    canvas.toBlob(async (blob) => {
      if (!blob) { setScanning(false); toast.error('Failed to capture image'); return }
      try {
        const res = await face.clockByFace(jobId, blob, phaseName)
        setResult(res)
        if (res.status === 'CLOCKED_IN' || res.status === 'CLOCKED_OUT') {
          toast.success(res.message)
          stopCamera()
          onSuccess?.(res)
          onClose()
        } else if (res.status === 'FALLBACK_PIN') {
          setMode('pin')
        }
      } catch (err) {
        toast.error(err.message ?? 'Face scan failed')
      } finally {
        setScanning(false)
      }
    }, 'image/jpeg', 0.9)
  }

  // ── PIN submit ─────────────────────────────────────────────────────────────

  async function handlePinSubmit(e) {
    e.preventDefault()
    if (!selectedWorker) { toast.error('Select a worker'); return }
    if (pin.length !== 4) { toast.error('Enter 4-digit PIN'); return }
    setSubmittingPin(true)
    try {
      const res = await face.clockByPin(jobId, selectedWorker, pin, phaseName)
      setResult(res)
      if (res.status === 'CLOCKED_IN' || res.status === 'CLOCKED_OUT') {
        toast.success(res.message)
        onSuccess?.(res)
        onClose()
      }
    } catch (err) {
      toast.error(err.message ?? 'PIN clock failed')
    } finally {
      setSubmittingPin(false)
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  const resultInfo = result ? STATUS_MESSAGES[result.status] : null

  return (
    <Modal open={open} onClose={onClose} title="Face Clock — Scan Worker" size="md">
      <div className="space-y-4">

        {/* Phase label */}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-[#505D7B]">Phase:</span>
          <span className="font-semibold text-[#07847F] bg-[#E0F7FA] px-3 py-0.5 rounded-full">{phaseName}</span>
        </div>

        {/* Mode toggle */}
        <div className="flex rounded-lg border border-[#DDE8EC] overflow-hidden">
          <button
            onClick={() => { setMode('camera'); setResult(null); if (!streamRef.current) startCamera() }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium transition-colors ${
              mode === 'camera' ? 'bg-[#07847F] text-white' : 'text-[#505D7B] hover:bg-gray-50'}`}>
            <Camera size={14} /> Face Scan
          </button>
          <button
            onClick={() => { setMode('pin'); setResult(null); stopCamera() }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium transition-colors ${
              mode === 'pin' ? 'bg-[#07847F] text-white' : 'text-[#505D7B] hover:bg-gray-50'}`}>
            <Keyboard size={14} /> PIN Fallback
          </button>
        </div>

        {/* ── Camera panel ── */}
        {mode === 'camera' && (
          <div className="space-y-3">
            <div className="relative rounded-xl overflow-hidden bg-black" style={{ aspectRatio: '4/3' }}>
              <video ref={videoRef} playsInline muted className="w-full h-full object-cover" />
              <canvas ref={canvasRef} className="hidden" />

              {/* Loading overlay while camera starts */}
              {!cameraReady && !cameraError && (
                <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
                  <div className="text-center text-white">
                    <Loader size={28} className="animate-spin mx-auto mb-2" />
                    <p className="text-sm">Starting camera…</p>
                  </div>
                </div>
              )}

              {/* Face guide overlay — only when stream is live */}
              {cameraReady && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-48 h-56 border-2 border-white/60 rounded-full" style={{
                    boxShadow: '0 0 0 9999px rgba(0,0,0,0.35)',
                  }} />
                </div>
              )}

              {scanning && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="text-white text-center">
                    <Loader size={32} className="animate-spin mx-auto mb-2" />
                    <p className="text-sm font-medium">Scanning…</p>
                  </div>
                </div>
              )}

              {cameraError && (
                <div className="absolute inset-0 bg-gray-900/80 flex items-center justify-center p-4">
                  <div className="text-center text-white">
                    <AlertTriangle size={28} className="mx-auto mb-2 text-yellow-400" />
                    <p className="text-sm">{cameraError}</p>
                    <button onClick={() => setMode('pin')}
                      className="mt-3 px-4 py-1.5 bg-[#FF7D44] rounded-lg text-sm font-medium">
                      Use PIN Instead
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Result feedback */}
            {result && resultInfo && result.status !== 'CLOCKED_IN' && result.status !== 'CLOCKED_OUT' && (
              <div className="flex items-start gap-2 p-3 rounded-lg text-sm"
                style={{ background: resultInfo.bg, color: resultInfo.color }}>
                <AlertTriangle size={15} className="mt-0.5 shrink-0" />
                <div>
                  <div className="font-semibold">{resultInfo.label}</div>
                  <div className="text-xs mt-0.5 opacity-80">{result.message}</div>
                </div>
              </div>
            )}

            {/* Scan button */}
            {!cameraError && (
              <button onClick={handleScan} disabled={scanning || !cameraReady}
                className="w-full py-3 flex items-center justify-center gap-2 bg-[#07847F] hover:bg-[#1C3F39] text-white font-semibold rounded-xl transition-colors disabled:opacity-60">
                {scanning ? <><Loader size={16} className="animate-spin" /> Scanning…</>
                  : !cameraReady ? <><Loader size={16} className="animate-spin" /> Starting camera…</>
                  : <><Camera size={16} /> Scan Face</>}
              </button>
            )}

            {result && (result.status === 'NO_FACE' || result.status === 'LOW_CONFIDENCE') && (
              <button onClick={() => { setResult(null); startCamera() }}
                className="w-full py-2 flex items-center justify-center gap-2 border border-[#DDE8EC] text-[#505D7B] text-sm font-medium rounded-xl hover:bg-gray-50">
                <RefreshCw size={14} /> Try Again
              </button>
            )}
          </div>
        )}

        {/* ── PIN panel ── */}
        {mode === 'pin' && (
          <form onSubmit={handlePinSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#505D7B] mb-1">Select Worker</label>
              <select value={selectedWorker} onChange={e => setSelectedWorker(e.target.value)}
                className="w-full px-3 py-2 border border-[#DDE8EC] rounded-lg text-sm focus:outline-none focus:border-[#07847F]">
                <option value="">— choose worker —</option>
                {workerList.filter(w => w.isActive !== false).map(w => (
                  <option key={w.id} value={w.id}>{w.name} ({w.employeeId ?? w.erpId ?? ''})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#505D7B] mb-1">4-Digit PIN</label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={pin}
                onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="••••"
                className="w-full px-3 py-2 border border-[#DDE8EC] rounded-lg text-sm text-center text-2xl tracking-[0.5em] font-mono focus:outline-none focus:border-[#07847F]"
              />
            </div>

            {result && resultInfo && (
              <div className="flex items-start gap-2 p-3 rounded-lg text-sm"
                style={{ background: resultInfo.bg, color: resultInfo.color }}>
                <AlertTriangle size={15} className="mt-0.5 shrink-0" />
                <div>
                  <div className="font-semibold">{resultInfo.label}</div>
                  <div className="text-xs mt-0.5 opacity-80">{result.message}</div>
                </div>
              </div>
            )}

            <button type="submit" disabled={submittingPin}
              className="w-full py-3 flex items-center justify-center gap-2 bg-[#07847F] hover:bg-[#1C3F39] text-white font-semibold rounded-xl transition-colors disabled:opacity-60">
              {submittingPin ? <><Loader size={16} className="animate-spin" /> Verifying…</> : <><UserCheck size={16} /> Clock In / Out</>}
            </button>
          </form>
        )}
      </div>
    </Modal>
  )
}
