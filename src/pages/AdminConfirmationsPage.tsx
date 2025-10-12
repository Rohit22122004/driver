import React from 'react'
import { Link } from 'react-router-dom'

interface Confirmation {
  confirmation_id?: string
  id?: string
  _id?: string
  [key: string]: any
}

export default function AdminConfirmationsPage() {
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [items, setItems] = React.useState<Confirmation[]>([])
  const [copiedId, setCopiedId] = React.useState<string | null>(null)
  const [queryId, setQueryId] = React.useState('')
  const [detailLoading, setDetailLoading] = React.useState(false)
  const [detailError, setDetailError] = React.useState<string | null>(null)
  const [detailData, setDetailData] = React.useState<any>(null)
  const [deletingId, setDeletingId] = React.useState<string | null>(null)
  const [confirming, setConfirming] = React.useState(false)
  const [confirmMsg, setConfirmMsg] = React.useState<string | null>(null)

  React.useEffect(() => {
    let active = true
    async function run() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch('http://localhost:5003/api/confirmations')
        if (!res.ok) {
          const j = await res.json().catch(() => null)
          throw new Error(j?.message || 'Failed to fetch confirmations')
        }
        const j = await res.json()
        const arr = Array.isArray(j)
          ? j
          : (Array.isArray(j?.data)
              ? j.data
              : (Array.isArray(j?.confirmation_ids)
                  ? (j.confirmation_ids as string[]).map((id) => ({ confirmation_id: id }))
                  : []))
        if (active) setItems(arr)
      } catch (err: any) {
        if (active) setError(err?.message || 'Failed to fetch confirmations')
      } finally {
        if (active) setLoading(false)
      }
    }
    run()
    return () => { active = false }
  }, [])

  const gradientBg = 'bg-gradient-to-br from-indigo-700 via-purple-700 to-emerald-600'

  const getId = (c: Confirmation): string => c.confirmation_id || c.id || c._id || ''

  const field = (label: string, value: any) => (
    <div className="flex justify-between text-xs"><span className="text-white/70">{label}</span><span className="text-white/95 ml-2 truncate">{value ?? '—'}</span></div>
  )

  const onCopy = async (id: string) => {
    try {
      await navigator.clipboard.writeText(id)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 1200)
    } catch {
      // ignore
    }
  }

  const fetchDetails = async (id: string) => {
    if (!id) return
    setDetailError(null)
    setDetailData(null)
    setDetailLoading(true)
    try {
      const res = await fetch(`http://localhost:5003/api/confirmations/${id}`)
      if (!res.ok) {
        const j = await res.json().catch(() => null)
        throw new Error(j?.message || 'Failed to fetch trip details')
      }
      const j = await res.json()
      setDetailData(j)
    } catch (e: any) {
      setDetailError(e?.message || 'Failed to fetch trip details')
    } finally {
      setDetailLoading(false)
    }
  }

  const confirmAssignment = async (id: string) => {
    if (!id) {
      setConfirmMsg('Please enter a confirmation ID')
      return
    }
    setConfirmMsg(null)
    setConfirming(true)
    try {
      const res = await fetch('http://localhost:5003/api/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ confirmation_id: id })
      })
      if (!res.ok) {
        const j = await res.json().catch(() => null)
        throw new Error(j?.message || `Failed to confirm assignment (HTTP ${res.status})`)
      }
      setConfirmMsg('Confirmation sent successfully')
    } catch (e: any) {
      setConfirmMsg(e?.message || 'Failed to confirm assignment')
    } finally {
      setConfirming(false)
    }
  }

  const deleteConfirmation = async (id: string) => {
    if (!id) return
    setDeletingId(id)
    try {
      const res = await fetch(`http://localhost:5003/api/confirmations/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const j = await res.json().catch(() => null)
        throw new Error(j?.message || 'Failed to delete confirmation')
      }
      setItems((prev) => prev.filter((c) => getId(c) !== id))
      if (detailData && (detailData.confirmation_id === id || detailData.id === id || detailData._id === id)) {
        setDetailData(null)
      }
    } catch (e) {
      // Optional toast could go here
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className={`min-h-screen ${gradientBg} p-4 flex items-stretch justify-center`}>
      <div className="w-full max-w-6xl space-y-4">
        <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md p-5 text-white">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">All Trip Confirmations</h1>
            <Link to="/admin/dashboard" className="rounded-md bg-slate-600 hover:bg-slate-700 px-3 py-2 text-sm">Back to Dashboard</Link>
          </div>

          {/* Query box */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-2">
            <input
              className="md:col-span-2 rounded-md bg-white/20 border border-white/30 px-3 py-2 placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-emerald-300 text-white"
              placeholder="Enter confirmation ID"
              value={queryId}
              onChange={(e) => setQueryId(e.target.value)}
            />
            <button
              type="button"
              onClick={() => confirmAssignment(queryId.trim())}
              disabled={confirming || !queryId.trim()}
              className="rounded-md bg-emerald-600 hover:bg-emerald-700 px-3 py-2 text-sm disabled:opacity-60"
            >
              {confirming ? 'Confirming…' : 'Confirm'}
            </button>
          </div>
          {confirmMsg && <div className="mt-2 text-sm text-white/90">{confirmMsg}</div>}

          {loading && (
            <div className="mt-6 flex items-center gap-3 text-white/90">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              <div>Loading confirmations…</div>
            </div>
          )}

          {error && <div className="mt-4 text-red-200 text-sm">{error}</div>}

          {!loading && !error && (
            items.length ? (
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((c, idx) => {
                  const id = getId(c)
                  return (
                    <div key={id || idx} className="rounded-xl border border-white/20 bg-white/10 p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="text-lg font-semibold">Confirmation</div>
                        <div className="text-xs opacity-80 font-mono truncate max-w-[160px]" title={id}>{id || '—'}</div>
                      </div>
                      <div className="space-y-1">
                        {field('Pickup', c.pickup)}
                        {field('Destination', c.destination)}
                        {field('Persons', c.persons)}
                        {field('Type', c.type)}
                        {field('Trip Price', c.trip_price != null ? `₹${c.trip_price}` : '—')}
                        {field('Status', c.status)}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => id && onCopy(id)}
                          className="rounded-md bg-emerald-600 hover:bg-emerald-700 px-3 py-2 text-xs"
                          disabled={!id}
                        >
                          {copiedId === id ? 'Copied!' : 'Copy ID'}
                        </button>
                        <button
                          type="button"
                          onClick={() => id && fetchDetails(id)}
                          className="rounded-md bg-indigo-600 hover:bg-indigo-700 px-3 py-2 text-xs"
                          disabled={!id}
                        >
                          Trip Details
                        </button>
                        <button
                          type="button"
                          onClick={() => id && deleteConfirmation(id)}
                          className="rounded-md bg-rose-600 hover:bg-rose-700 px-3 py-2 text-xs disabled:opacity-60"
                          disabled={!id || deletingId === id}
                        >
                          {deletingId === id ? 'Deleting…' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="mt-4 text-white/90">No confirmations found.</div>
            )
          )}
        </div>

        {/* Details viewer */}
        <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md p-5 text-white">
          <div className="text-lg font-semibold">Trip Details</div>
          {detailLoading && (
            <div className="mt-3 flex items-center gap-3">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              <div className="text-white/90 text-sm">Loading…</div>
            </div>
          )}
          {detailError && <div className="mt-3 text-sm text-red-200">{detailError}</div>}
          {!detailLoading && !detailError && detailData && (
            <div className="mt-3 text-sm">
              <dl className="grid grid-cols-3 gap-x-3 gap-y-2">
                {Object.keys(detailData).map((k) => (
                  <React.Fragment key={k}>
                    <dt className="col-span-1 text-white/70">{k}</dt>
                    <dd className="col-span-2 text-white/95 break-words">{typeof (detailData as any)[k] === 'object' ? JSON.stringify((detailData as any)[k]) : String((detailData as any)[k])}</dd>
                  </React.Fragment>
                ))}
              </dl>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
