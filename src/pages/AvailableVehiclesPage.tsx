import React from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'

interface Vehicle {
  id?: string
  _id?: string
  vehicle_id?: string
  name?: string
  model?: string
  type?: string
  seats?: number
  capacity?: number
  pricePerKm?: number
  baseFare?: number
  [key: string]: any
}

export default function AvailableVehiclesPage() {
  const { id: tripId } = useParams<{ id: string }>()
  const nav = useNavigate()
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [vehicles, setVehicles] = React.useState<Vehicle[]>([])

  React.useEffect(() => {
    let active = true
    async function run() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch('http://localhost:5002/api/vehicles')
        if (!res.ok) {
          const j = await res.json().catch(() => null)
          throw new Error(j?.message || 'Failed to fetch vehicles')
        }
        const j = await res.json()
        if (active) setVehicles(Array.isArray(j) ? j : (j?.data ?? []))
      } catch (err: any) {
        if (active) setError(err?.message || 'Failed to fetch vehicles')
      } finally {
        if (active) setLoading(false)
      }
    }
    run()
    return () => { active = false }
  }, [])

  const gradientBg = 'bg-gradient-to-br from-indigo-700 via-purple-700 to-emerald-600'

  const getVehicleId = (v: Vehicle) => v.vehicle_id || v.id || v._id || ''

  const pretty = (value: any): string => {
    if (value === null || value === undefined) return '—'
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return String(value)
    if (Array.isArray(value)) return value.join(', ')
    return JSON.stringify(value)
  }

  return (
    <div className={`min-h-screen ${gradientBg} p-4 flex items-stretch justify-center`}>
      <div className="w-full max-w-6xl space-y-4">
        <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md p-5 text-white">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Available Vehicles</h1>
            <div className="text-sm opacity-80">Trip ID: <span className="font-mono">{tripId}</span></div>
          </div>

          {loading && <div className="mt-4">Loading…</div>}
          {error && <div className="mt-4 text-red-200 text-sm">{error}</div>}

          {!loading && !error && (
            vehicles.length ? (
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {vehicles.map((v) => (
                  <div key={getVehicleId(v) || Math.random()} className="rounded-xl border border-white/20 bg-white/10 p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-lg font-semibold">{v.name || v.model || v.type || 'Vehicle'}</div>
                      <div className="text-xs opacity-80">{v.type || '—'}</div>
                    </div>
                    <div className="text-sm space-y-1">
                      <div><span className="text-white/70">Seats:</span> {v.seats ?? v.capacity ?? '—'}</div>
                      <div><span className="text-white/70">Base Fare:</span> {v.baseFare != null ? `₹${v.baseFare}` : '—'}</div>
                      <div><span className="text-white/70">Price/Km:</span> {v.pricePerKm != null ? `₹${v.pricePerKm}` : '—'}</div>
                    </div>
                    <div className="text-xs text-white/70">ID: {getVehicleId(v) || '—'}</div>
                    {/* Fallback to show any additional useful fields */}
                    <details className="text-xs opacity-90">
                      <summary className="cursor-pointer">More</summary>
                      <div className="mt-1 space-y-0.5">
                        {Object.keys(v).filter(k => !['id','_id','vehicle_id','name','model','type','seats','capacity','pricePerKm','baseFare'].includes(k)).map(k => (
                          <div key={k}><span className="text-white/70">{k}:</span> {pretty((v as any)[k])}</div>
                        ))}
                      </div>
                    </details>
                    <button
                      type="button"
                      onClick={() => nav(`/passenger/trip/${tripId}/summary`, { state: { vehicle: v } })}
                      className="w-full mt-2 rounded-md bg-emerald-600 hover:bg-emerald-700 px-3 py-2 text-sm"
                    >
                      Select
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-4 text-white/90">No vehicles available.</div>
            )
          )}
        </div>

        <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md p-5 text-white flex items-center justify-between">
          <Link to={`/passenger/trip/${tripId}`} className="rounded-md bg-blue-600 hover:bg-blue-700 px-3 py-2 text-sm">Back to Details</Link>
          <Link to="/passenger/plan" className="rounded-md bg-indigo-600 hover:bg-indigo-700 px-3 py-2 text-sm">Back to Planner</Link>
        </div>
      </div>
    </div>
  )
}
