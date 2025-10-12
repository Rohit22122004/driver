import React from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'

interface PlannerState {
  pickup?: string
  destination?: string
  stops?: string[]
}

export default function TripCreatePage() {
  const nav = useNavigate()
  const location = useLocation()
  const state = (location.state || {}) as PlannerState
  const [persons, setPersons] = React.useState<number>(1)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const pickup = state.pickup || ''
  const destination = state.destination || ''
  const stops = state.stops || []

  const canSubmit = pickup.trim().length > 0 && destination.trim().length > 0 && persons > 0

  const onSubmit = async () => {
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('http://localhost:5001/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pickup, destination, stops, persons }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.message || 'Failed to create trip')
      }
      const data = (await res.json().catch(() => ({}))) as { trip_id?: string; id?: string; _id?: string; tripId?: string }
      const id = data.trip_id || data.id || data._id || data.tripId
      if (!id) throw new Error('Trip ID missing in response')
      nav(`/passenger/trip/${id}`)
    } catch (err: any) {
      setError(err?.message || 'Failed to create trip')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-700 via-purple-700 to-emerald-600 p-4 flex items-stretch justify-center">
      <div className="w-full max-w-3xl grid md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md p-5 text-white space-y-4">
          <h1 className="text-2xl font-semibold">Confirm Trip</h1>
          <div className="text-white/90 text-sm">Review your trip details and set the number of passengers.</div>

          <div className="space-y-2 text-sm">
            <div><span className="font-medium">Pickup:</span> {pickup || '—'}</div>
            <div><span className="font-medium">Destination:</span> {destination || '—'}</div>
            <div>
              <span className="font-medium">Stops:</span> {stops.length ? stops.join(' → ') : 'None'}
            </div>
          </div>

          <div>
            <label className="block text-sm mb-1">Persons</label>
            <input
              type="number"
              min={1}
              className="w-full rounded-md bg-white/20 border border-white/30 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-300"
              value={persons}
              onChange={(e) => setPersons(Math.max(1, Number(e.target.value || 1)))}
            />
          </div>

          {error && <div className="text-red-200 text-sm">{error}</div>}

          <button
            type="button"
            disabled={!canSubmit || loading}
            onClick={onSubmit}
            className="w-full rounded-md bg-emerald-500 hover:bg-emerald-600 px-3 py-2 font-medium disabled:opacity-60"
          >
            {loading ? 'Creating…' : 'OK'}
          </button>

          <div className="text-sm opacity-80">
            <Link className="underline" to="/passenger/plan">Back to planner</Link>
          </div>
        </div>

        <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md p-5 text-white space-y-3">
          <h2 className="text-xl font-semibold">What happens next?</h2>
          <ul className="list-disc list-inside text-sm text-white/90 space-y-1">
            <li>We create a trip with your route and passenger count.</li>
            <li>After creation, you will be redirected to the trip details page.</li>
            <li>From there, you can view status, distance, and other metadata.</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
