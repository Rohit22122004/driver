import React from 'react'
import { useLocation, useParams, Link } from 'react-router-dom'

export default function TripVehicleSummaryPage() {
  const { id: tripId } = useParams<{ id: string }>()
  const location = useLocation()
  const [trip, setTrip] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [submitting, setSubmitting] = React.useState(false)
  const [submitError, setSubmitError] = React.useState<string | null>(null)

  // vehicle object is passed via navigation state
  const vehicleFromState = (location.state as any)?.vehicle

  // Persist vehicle in sessionStorage in case of refresh/navigation
  React.useEffect(() => {
    if (vehicleFromState) {
      sessionStorage.setItem('selected_vehicle', JSON.stringify(vehicleFromState))
    }
  }, [vehicleFromState])

  const vehicle = React.useMemo(() => {
    try {
      return vehicleFromState || JSON.parse(sessionStorage.getItem('selected_vehicle') || 'null')
    } catch {
      return vehicleFromState || null
    }
  }, [vehicleFromState])

  React.useEffect(() => {
    let active = true
    async function run() {
      if (!tripId) return
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`http://localhost:5001/api/trips/${tripId}`)
        if (!res.ok) {
          const j = await res.json().catch(() => null)
          throw new Error(j?.message || 'Failed to fetch trip')
        }
        const j = await res.json()
        if (active) setTrip(j)
      } catch (err: any) {
        if (active) setError(err?.message || 'Failed to fetch trip')
      } finally {
        if (active) setLoading(false)
      }
    }
    run()
    return () => { active = false }
  }, [tripId])

  const gradientBg = 'bg-gradient-to-br from-indigo-700 via-purple-700 to-emerald-600'

  const extractTripPrice = (t: any): number | null => {
    if (!t) return null
    const p = t.price ?? t.fare ?? t.total ?? t.amount
    return typeof p === 'number' ? p : (typeof p === 'string' ? parseFloat(p) : null)
  }

  const extractDistanceKm = (t: any): number | null => {
    if (!t) return null
    if (typeof t.distanceText === 'string') {
      const m = parseFloat(t.distanceText)
      return isNaN(m) ? null : m
    }
    if (typeof t.distance === 'number') {
      // assume meters if large
      return t.distance > 1000 ? t.distance / 1000 : t.distance
    }
    return null
  }

  const tripPrice = extractTripPrice(trip)
  const distKm = extractDistanceKm(trip)
  const estPrice = React.useMemo(() => {
    if (!vehicle || distKm == null) return null
    const base = typeof vehicle.baseFare === 'number' ? vehicle.baseFare : 0
    const perKm = typeof vehicle.pricePerKm === 'number' ? vehicle.pricePerKm : 0
    if (base === 0 && perKm === 0) return null
    return Math.round((base + perKm * distKm) * 100) / 100
  }, [vehicle, distKm])

  const field = (label: string, value: any) => (
    <div className="flex justify-between text-sm"><span className="text-white/80">{label}</span><span className="text-white/95 ml-2">{value ?? '—'}</span></div>
  )

  const prettyArray = (arr: any[]) => Array.isArray(arr) && arr.length ? arr.join(' → ') : 'None'

  const onProceed = async () => {
    setSubmitError(null)
    if (!tripId || !trip) {
      setSubmitError('Missing trip data')
      return
    }
    const body = {
      pickup: trip.pickup,
      destination: trip.destination,
      stops: Array.isArray(trip.stops) ? trip.stops : [],
      persons: typeof trip.persons === 'number' ? trip.persons : 1,
      trip_price: (tripPrice != null ? tripPrice : (estPrice != null ? estPrice : 0)),
      type: vehicle?.type || 'VEHICLE'
    }
    setSubmitting(true)
    try {
      const res = await fetch('http://localhost:5003/api/confirmations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      if (!res.ok) {
        const j = await res.json().catch(() => null)
        throw new Error(j?.message || 'Failed to create confirmation')
      }
      const j = await res.json().catch(() => ({})) as any
      const confirmationId = j.confirmation_id || j.id || j._id || j.confirmationId
      if (!confirmationId) throw new Error('Missing confirmation id in response')
      // Navigate to status page to wait for assignment
      window.location.assign(`/passenger/trip/${tripId}/confirmation`)
      // Prefer react-router navigate with state, but window.location ensures hard load
      // nav(`/passenger/trip/${tripId}/confirmation`, { state: { confirmationId } })
      sessionStorage.setItem('last_confirmation_id', confirmationId)
    } catch (e: any) {
      setSubmitError(e?.message || 'Failed to create confirmation')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={`min-h-screen ${gradientBg} p-4 flex items-stretch justify-center`}>
      <div className="w-full max-w-6xl space-y-4">
        <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md p-5 text-white">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Trip & Vehicle Summary</h1>
            <div className="text-sm opacity-80">Trip ID: <span className="font-mono">{tripId}</span></div>
          </div>

          {loading && <div className="mt-4">Loading…</div>}
          {error && <div className="mt-4 text-red-200 text-sm">{error}</div>}

          {!loading && !error && (
            <div className="mt-4 grid md:grid-cols-2 gap-4">
              {/* Trip card */}
              <div className="rounded-xl border border-white/20 bg-white/10 p-4 space-y-2">
                <div className="text-lg font-semibold">Trip Details</div>
                {field('Pickup', trip?.pickup)}
                {field('Destination', trip?.destination)}
                {field('Stops', prettyArray(trip?.stops || []))}
                {field('Persons', trip?.persons)}
                {field('Distance', trip?.distanceText || trip?.distance)}
                {field('ETA', trip?.durationText || trip?.eta)}
                {field('Trip Price', tripPrice != null ? `₹${tripPrice}` : '—')}
                {field('Status', trip?.status)}
              </div>

              {/* Vehicle card */}
              <div className="rounded-xl border border-white/20 bg-white/10 p-4 space-y-2">
                <div className="text-lg font-semibold">Selected Vehicle</div>
                {vehicle ? (
                  <>
                    {field('Name/Model', vehicle.name || vehicle.model || vehicle.type || 'Vehicle')}
                    {field('Type', vehicle.type)}
                    {field('Seats', vehicle.seats ?? vehicle.capacity)}
                    {field('Base Fare', vehicle.baseFare != null ? `₹${vehicle.baseFare}` : '—')}
                    {field('Price/Km', vehicle.pricePerKm != null ? `₹${vehicle.pricePerKm}` : '—')}
                    {field('Vehicle ID', vehicle.vehicle_id || vehicle.id || vehicle._id)}
                    {field('Estimated Price', estPrice != null ? `₹${estPrice}` : '—')}
                  </>
                ) : (
                  <div className="text-sm">No vehicle selected. Go back and choose one.</div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md p-5 text-white flex items-center justify-between">
          <div className="space-x-2">
            <Link to={`/passenger/trip/${tripId}/vehicles`} className="rounded-md bg-blue-600 hover:bg-blue-700 px-3 py-2 text-sm">Back to Vehicles</Link>
            <Link to={`/passenger/trip/${tripId}`} className="rounded-md bg-slate-600 hover:bg-slate-700 px-3 py-2 text-sm">Back to Details</Link>
          </div>
          <div className="flex items-center gap-3">
            {submitError && <div className="text-red-200 text-sm">{submitError}</div>}
            <button
              type="button"
              disabled={submitting}
              onClick={onProceed}
              className="rounded-md bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-sm disabled:opacity-60"
            >
              {submitting ? 'Submitting…' : 'Proceed'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
