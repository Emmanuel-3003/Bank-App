
import { useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { parseApiError } from '../utils/errors'

export default function Login() {
  const location = useLocation()
  const { isAuthenticated, signIn } = useAuth()

  const [form, setForm] = useState({
    email: location.state?.email || '',
    password: '',
  })

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  function handleChange(event) {
    const { name, value } = event.target

    setForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    if (!form.email.trim() || !form.password) {
      setError('Enter your email and password.')
      return
    }

    setLoading(true)

    try {
      await signIn(form.email.trim(), form.password)
    } catch (err) {
      setError(parseApiError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10 sm:px-6">
      <div className="w-full max-w-md">

        {/* Brand */}
        <Link
          to="/login"
          className="mb-6 flex items-center justify-center gap-3"
          aria-label="Bank sign in"
        >
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-teal-700 text-xl font-bold text-white shadow-sm">
            B
          </span>

          <span className="text-2xl font-bold tracking-tight text-slate-900">
            Bank
          </span>
        </Link>

        {/* Login card */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/60 sm:p-8">

          <div className="mb-7">
            <p className="text-sm font-semibold uppercase tracking-wider text-teal-700">
              Welcome back
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Sign in
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Access your accounts and manage your banking securely.
            </p>
          </div>

          {/* Registration notice */}
          {location.state?.notice && (
            <p
              role="status"
              className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-5 text-emerald-800"
            >
              {location.state.notice}
            </p>
          )}

          {/* Error message */}
          {error && (
            <p
              role="alert"
              className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700"
            >
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Email address
              </label>

              <input
                id="email"
                name="email"
                type="email"
                autoComplete="username"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Password
              </label>

              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center rounded-xl bg-teal-700 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-teal-800 focus:outline-none focus:ring-4 focus:ring-teal-600/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Signing in…' : 'Sign in to your account'}
            </button>
          </form>

          <div className="my-6 border-t border-slate-100" />

          <p className="text-center text-sm text-slate-500">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-semibold text-teal-700 hover:text-teal-800 hover:underline"
            >
              Create an account
            </Link>
          </p>
        </section>

        <p className="mt-6 text-center text-xs text-slate-400">
          Secure access to your banking dashboard
        </p>
      </div>
    </main>
  )
}
