import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { register } from '../api/auth'
import { useAuth } from '../context/AuthContext'
import Field from '../components/Field'
import { parseApiError } from '../utils/errors'

const EMPTY_FORM = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  dateOfBirth: '',
  address: '',
  city: '',
  state: '',
  country: '',
  pinCode: '',
}

// Today as YYYY-MM-DD in the user's own timezone.
function todayIso() {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

// These rules mirror what the backend enforces, so people get a clear message first.
function validate(form) {
  const errors = {}

  if (form.firstName.trim().length < 3) errors.firstName = 'First name must be at least 3 characters.'
  if (form.lastName.trim().length < 3) errors.lastName = 'Last name must be at least 3 characters.'

  if (!form.email.trim()) errors.email = 'Email is required.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errors.email = 'Enter a valid email address.'

  if (form.password.length < 8) errors.password = 'Password must be at least 8 characters.'
  if (form.confirmPassword !== form.password) errors.confirmPassword = 'Passwords do not match.'

  if (!form.dateOfBirth) errors.dateOfBirth = 'Date of birth is required.'
  else if (form.dateOfBirth >= todayIso()) errors.dateOfBirth = 'Date of birth must be in the past.'

  if (!form.address.trim()) errors.address = 'Address is required.'
  else if (form.address.trim().length > 200) errors.address = 'Address can be at most 200 characters.'

  if (!form.city.trim()) errors.city = 'City is required.'
  if (!form.state.trim()) errors.state = 'State is required.'
  if (!form.country.trim()) errors.country = 'Country is required.'

  if (!/^[1-9][0-9]{5}$/.test(form.pinCode.trim())) errors.pinCode = 'Pin code must be a valid 6-digit number.'

  return errors
}

export default function Register() {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)

  if (isAuthenticated) return <Navigate to="/" replace />

  function handleChange(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    if (errors[name]) setErrors((current) => ({ ...current, [name]: undefined }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setServerError('')

    const found = validate(form)
    setErrors(found)
    if (Object.keys(found).length > 0) return

    const { confirmPassword, ...rest } = form
    const payload = Object.fromEntries(
      Object.entries(rest).map(([key, value]) => [key, key === 'password' ? value : value.trim()])
    )

    setLoading(true)
    try {
      await register(payload)
      navigate('/login', {
        replace: true,
        state: { email: payload.email, notice: 'Registration complete. Sign in to continue.' },
      })
    } catch (err) {
      setServerError(parseApiError(err))
    } finally {
      setLoading(false)
    }
  }

  const bind = (name) => ({ name, value: form[name], onChange: handleChange, error: errors[name] })

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <div className="w-full max-w-xl rounded-xl bg-white p-8 shadow">
        <h1 className="text-2xl font-semibold text-slate-900">Create your account</h1>
        <p className="mt-1 text-sm text-slate-500">Your details are used to set up your customer profile.</p>

        {serverError && (
          <p role="alert" className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {serverError}
          </p>
        )}

        <form onSubmit={handleSubmit} noValidate className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field label="First name" autoComplete="given-name" {...bind('firstName')} />
          <Field label="Last name" autoComplete="family-name" {...bind('lastName')} />
          <Field label="Email" type="email" autoComplete="email" {...bind('email')} />
          <Field label="Date of birth" type="date" max={todayIso()} {...bind('dateOfBirth')} />
          <Field label="Password" type="password" autoComplete="new-password" hint="At least 8 characters." {...bind('password')} />
          <Field label="Confirm password" type="password" autoComplete="new-password" {...bind('confirmPassword')} />
          <div className="sm:col-span-2">
            <Field label="Address" autoComplete="street-address" {...bind('address')} />
          </div>
          <Field label="City" {...bind('city')} />
          <Field label="State" {...bind('state')} />
          <Field label="Country" {...bind('country')} />
          <Field label="Pin code" inputMode="numeric" maxLength={6} {...bind('pinCode')} />

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-teal-800 disabled:opacity-60"
            >
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already registered?{' '}
          <Link to="/login" className="font-medium text-teal-700 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}