import React from 'react'
import { useNavigate, Link } from 'react-router-dom'

export default function RegisterPage() {
  const nav = useNavigate()
  const [name, setName] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [phone, setPhone] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [role, setRole] = React.useState<'DRIVER' | 'ADMIN' | 'PASSENGER'>('DRIVER')
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [ok, setOk] = React.useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setOk(false)
    setLoading(true)
    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role, phone }),
      })
      if (res.ok) {
        setOk(true)
        setTimeout(() => nav('/login'), 800)
      } else {
        const data = await res.json().catch(() => null)
        throw new Error(data?.message || 'Registration failed')
      }
    } catch (err: any) {
      setError(err?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center p-4"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1502082553048-f009c37129b9?q=80&w=1600&auto=format&fit=crop')",
      }}
    >
      <div className="w-full max-w-md rounded-2xl border border-white/30 bg-white/10 backdrop-blur-md shadow-xl p-6 text-white">
        <h1 className="text-2xl font-semibold text-center mb-6">Create Account</h1>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Full Name</label>
            <input
              className="w-full rounded-md bg-white/20 border border-white/30 px-3 py-2 placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-emerald-300"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              type="email"
              className="w-full rounded-md bg-white/20 border border-white/30 px-3 py-2 placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-emerald-300"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Phone Number</label>
            <input
              className="w-full rounded-md bg-white/20 border border-white/30 px-3 py-2 placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-emerald-300"
              placeholder="Enter phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              pattern="[0-9]{10,}"
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Password</label>
            <input
              type="password"
              className="w-full rounded-md bg-white/20 border border-white/30 px-3 py-2 placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-emerald-300"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Role</label>
            <select
              className="w-full rounded-md bg-white/20 border border-white/30 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-300"
              value={role}
              onChange={(e) => setRole(e.target.value as 'DRIVER' | 'ADMIN' | 'PASSENGER')}
            >
              <option className="bg-gray-800" value="DRIVER">Driver</option>
              <option className="bg-gray-800" value="ADMIN">Admin</option>
              <option className="bg-gray-800" value="PASSENGER">Passenger</option>
            </select>
          </div>

          {error && <div className="text-red-200 text-sm">{error}</div>}
          {ok && <div className="text-emerald-200 text-sm">Registered! Redirecting to login…</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-blue-600 text-white hover:bg-blue-700 px-3 py-2 font-medium disabled:opacity-60"
          >
            {loading ? 'Registering…' : 'REGISTER'}
          </button>
        </form>

        <div className="mt-4 text-center text-sm">
          Already have an account?{' '}
          <Link to="/login" className="underline font-medium">Back to Login</Link>
        </div>
      </div>
    </div>
  )
}

