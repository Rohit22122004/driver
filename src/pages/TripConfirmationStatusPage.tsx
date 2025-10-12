import React from 'react'
import { useLocation, useNavigate, useParams, Link } from 'react-router-dom'

export default function TripConfirmationStatusPage() {
  const { id: tripId } = useParams<{ id: string }>()
  const location = useLocation()
  const nav = useNavigate()
  const confirmationIdFromState: string | undefined = (location.state as any)?.confirmationId

  const [confirmationId, setConfirmationId] = React.useState<string | null>(confirmationIdFromState || null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [data, setData] = React.useState<any>(null)

  React.useEffect(() => {
    if (confirmationIdFromState) setConfirmationId(confirmationIdFromState)
    if (!confirmationIdFromState) {
      const fromStorage = sessionStorage.getItem('last_confirmation_id')
      if (fromStorage) setConfirmationId(fromStorage)
    }
  }, [confirmationIdFromState])

  React.useEffect(() => {
    if (!confirmationId) return
    let active = true
    let timer: any

    const poll = async () => {
      if (!active) return
      try {
        const res = await fetch(`http://localhost:5003/api/assignments/confirmation/${confirmationId}`)
        if (res.ok) {
          const j = await res.json().catch(() => null)
          if (!active) return
          if (j) {
            setData(j)
            setLoading(false)
            return // stop polling on first successful payload
          }
        }
        // transient: keep waiting and try again
        if (!active) return
        setLoading(true)
        timer = setTimeout(poll, 2000)
      } catch (_) {
        // ignore transient errors, keep spinner
        if (!active) return
        setLoading(true)
        timer = setTimeout(poll, 2000)
      }
    }

    setLoading(true)
    setError(null)
    poll()

    return () => {
      active = false
      if (timer) clearTimeout(timer)
    }
  }, [confirmationId])

  const gradientBg = 'bg-gradient-to-br from-indigo-700 via-purple-700 to-emerald-600'

  const formatValue = (val: any): string => {
    if (val === null || val === undefined) return '—'
    if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') return String(val)
    if (Array.isArray(val)) return val.join(', ')
    return JSON.stringify(val)
  }

  return (
    <div className={`min-h-screen ${gradientBg} p-4 flex items-stretch justify-center`}>
      <div className="w-full max-w-4xl space-y-4">
        <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md p-5 text-white">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Trip Confirmation</h1>
            <div className="text-sm opacity-80">Trip ID: <span className="font-mono">{tripId}</span></div>
          </div>

          {!confirmationId && (
            <div className="mt-4 text-amber-200 text-sm">No confirmation ID provided.</div>
          )}

          {confirmationId && (
            <div className="mt-2 text-sm opacity-90">Confirmation ID: <span className="font-mono">{confirmationId}</span></div>
          )}

          {loading && (
            <div className="mt-6 flex items-center gap-3 text-white/90">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              <div>Waiting for assignment…</div>
            </div>
          )}

          {error && <div className="mt-4 text-red-200 text-sm">{error}</div>}

          {!loading && !error && data && (
            <div className="mt-4">
              <div className="text-white/95 font-medium mb-2">Response</div>
              <dl className="grid grid-cols-3 gap-x-3 gap-y-2 text-sm">
                {Object.keys(data).map((k) => (
                  <React.Fragment key={k}>
                    <dt className="col-span-1 text-white/70">{k}</dt>
                    <dd className="col-span-2 text-white/95 break-words">{formatValue((data as any)[k])}</dd>
                  </React.Fragment>
                ))}
              </dl>

              {/* New action visible only after success */}
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => {
                    const did = (data as any)?.driver_id
                    if (did) nav(`/driver/assignments/${encodeURIComponent(String(did))}`)
                  }}
                  disabled={!((data as any)?.driver_id)}
                  className={`rounded-md px-4 py-2 text-sm ${((data as any)?.driver_id) ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-emerald-600/50 cursor-not-allowed'}`}
                >
                  diver confirmation
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md p-5 text-white flex items-center justify-between">
          <div className="space-x-2">
            <Link to={`/passenger/trip/${tripId}/summary`} className="rounded-md bg-blue-600 hover:bg-blue-700 px-3 py-2 text-sm">Back to Summary</Link>
            <Link to={`/passenger/trip/${tripId}`} className="rounded-md bg-slate-600 hover:bg-slate-700 px-3 py-2 text-sm">Back to Details</Link>
          </div>
          {/* Done button removed as per request */}
        </div>
      </div>
    </div>
  )
}
