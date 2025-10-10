import React from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { http } from '../api/http'

export default function LoginPage() {
  const nav = useNavigate()
  const [username, setUsername] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [role, setRole] = React.useState<'driver'|'admin'>('driver')
  const [remember, setRemember] = React.useState(true)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const resp = await http.post<{ ok: boolean; role: 'driver' | 'admin' }>(
        '/api/login',
        { username, password, remember, role }
      )
      const roleFromServer = resp.data?.role || 'driver'
      localStorage.setItem('role', roleFromServer)
      if (roleFromServer === 'admin') nav('/admin/dashboard')
      else nav('/driver/dashboard')
    } catch (err: any) {
      setError(err?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen w-full relative bg-cover bg-center flex items-center justify-center"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1526772662000-3f88f10405ff?q=80&w=1920&auto=format&fit=crop')",
      }}
    >
      {/* dark overlay for readability (behind header) */}
      <div className="absolute inset-0 bg-black/45 z-10" />

      <div className="relative z-20 w-full max-w-md mx-4 rounded-2xl border border-white/30 bg-white/10 backdrop-blur-md shadow-2xl p-6 text-white">
        <h1 className="text-2xl font-semibold text-center mb-6">Login to Your Account</h1>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Role</label>
            <select
              className="w-full rounded-md bg-white/20 border border-white/30 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-300"
              value={role}
              onChange={(e) => setRole(e.target.value as 'driver'|'admin')}
            >
              <option value="driver">Driver</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">Username</label>
            <input
              className="w-full rounded-md bg-white/20 border border-white/30 px-3 py-2 placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-emerald-300"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Password</label>
            <input
              type="password"
              className="w-full rounded-md bg-white/20 border border-white/30 px-3 py-2 placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-emerald-300"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="flex items-center justify-between text-sm">
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" className="accent-slate-600" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
              Remember me
            </label>
            <button type="button" className="opacity-75 hover:opacity-100">Forgot Password?</button>
          </div>

          {error && <div className="text-red-200 text-sm">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-blue-600 text-white hover:bg-blue-700 px-3 py-2 font-medium disabled:opacity-60"
          >
            {loading ? 'Logging in…' : 'LOGIN'}
          </button>
        </form>

        <div className="mt-4 text-center text-sm">
          Don’t have an account?{' '}
          <Link to="/register" className="underline font-medium">Register Now</Link>
        </div>
      </div>
    </div>
  )
}
