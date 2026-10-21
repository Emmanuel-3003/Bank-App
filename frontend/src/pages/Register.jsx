
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

function todayIso() {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')

  return `${now.getFullYear()}-${month}-${day}`
}

function validate(form) {
  const errors = {}

  if (form.firstName.trim().length < 3) {
    errors.firstName = 'First name must be at least 3 characters.'
  }

  if (form.lastName.trim().length < 3) {
    errors.lastName = 'Last name must be at least 3 characters.'
  }

  if (!form.email.trim()) {
    errors.email = 'Email is required.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = 'Enter a valid email address.'
  }

  if (form.password.length < 8) {
    errors.password = 'Password must be at least 8 characters.'
  }

  if (form.confirmPassword !== form.password) {
    errors.confirmPassword = 'Passwords do not match.'
  }

  if (!form.dateOfBirth) {
    errors.dateOfBirth = 'Date of birth is required.'
  } else if (form.dateOfBirth >= todayIso()) {
    errors.dateOfBirth = 'Date of birth must be in the past.'
  }

  if (!form.address.trim()) {
    errors.address = 'Address is required.'
  } else if (form.address.trim().length > 200) {
    errors.address = 'Address can be at most 200 characters.'
  }

  if (!form.city.trim()) errors.city = 'City is required.'
  if (!form.state.trim()) errors.state = 'State is required.'
  if (!form.country.trim()) errors.country = 'Country is required.'

  if (!/^[1-9][0-9]{5}$/.test(form.pinCode.trim())) {
    errors.pinCode = 'Pin code must be a valid 6-digit number.'
  }

  return errors
}

export default function Register() {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
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

    if (errors[name]) {
      setErrors((current) => ({
        ...current,
        [name]: undefined,
      }))
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setServerError('')

    const foundErrors = validate(form)
    setErrors(foundErrors)

    if (Object.keys(foundErrors).length > 0) return

    const { confirmPassword, ...rest } = form

    const payload = Object.fromEntries(
      Object.entries(rest).map(([key, value]) => [
        key,
        key === 'password' ? value : value.trim(),
      ])
    )

    setLoading(true)

    try {
      await register(payload)

      navigate('/login', {
        replace: true,
        state: {
          email: payload.email,
          notice: 'Registration complete. Sign in to continue.',
        },
      })
    } catch (err) {
      setServerError(parseApiError(err))
    } finally {
      setLoading(false)
    }
  }

  const bind = (name) => ({
    name,
    value: form[name],
    onChange: handleChange,
    error: errors[name],
  })

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10 sm:px-6">
      <div className="w-full max-w-3xl">

        {/* Brand */}
        <Link
          to="/register"
          className="mb-6 flex items-center justify-center gap-3"
          aria-label="Bank registration"
        >
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-teal-700 text-xl font-bold text-white shadow-sm">
            B
          </span>

          <span className="text-2xl font-bold tracking-tight text-slate-900">
            Bank
          </span>
        </Link>

        {/* Registration card */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg shadow-slate-200/60">

          <div className="border-b border-slate-100 bg-slate-50 px-6 py-6 sm:px-8">
            <p className="text-sm font-semibold uppercase tracking-wider text-teal-700">
              Get started
            </p>

            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Create your account
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Enter your details to create your banking profile.
            </p>
          </div>

          <div className="p-6 sm:p-8">
            {serverError && (
              <p
                role="alert"
                className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700"
              >
                {serverError}
              </p>
            )}

            <form
              onSubmit={handleSubmit}
              noValidate
              className="grid grid-cols-1 gap-x-5 gap-y-5 sm:grid-cols-2"
            >
              <Field
                label="First name"
                autoComplete="given-name"
                {...bind('firstName')}
              />

              <Field
                label="Last name"
                autoComplete="family-name"
                {...bind('lastName')}
              />

              <Field
                label="Email address"
                type="email"
                autoComplete="email"
                {...bind('email')}
              />

              <Field
                label="Date of birth"
                type="date"
                max={todayIso()}
                autoComplete="bday"
                {...bind('dateOfBirth')}
              />

              <Field
                label="Password"
                type="password"
                autoComplete="new-password"
                hint="Use at least 8 characters."
                {...bind('password')}
              />

              <Field
                label="Confirm password"
                type="password"
                autoComplete="new-password"
                {...bind('confirmPassword')}
              />

              <div className="sm:col-span-2">
                <div className="mb-4 border-t border-slate-100 pt-5">
                  <h2 className="text-base font-semibold text-slate-900">
                    Address details
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Provide your residential address.
                  </p>
                </div>

                <Field
                  label="Address"
                  autoComplete="street-address"
                  {...bind('address')}
                />
              </div>

              <Field
                label="City"
                autoComplete="address-level2"
                {...bind('city')}
              />

              <Field
                label="State"
                autoComplete="address-level1"
                {...bind('state')}
              />

              <Field
                label="Country"
                autoComplete="country-name"
                {...bind('country')}
              />

              <Field
                label="Pin code"
                inputMode="numeric"
                maxLength={6}
                autoComplete="postal-code"
                {...bind('pinCode')}
              />

              <div className="mt-2 sm:col-span-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-teal-800 focus:outline-none focus:ring-4 focus:ring-teal-600/20 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? 'Creating account…' : 'Create account'}
                </button>
              </div>
            </form>

            <div className="my-6 border-t border-slate-100" />

            <p className="text-center text-sm text-slate-500">
              Already registered?{' '}
              <Link
                to="/login"
                className="font-semibold text-teal-700 hover:text-teal-800 hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </section>

        <p className="mt-6 text-center text-xs text-slate-400">
          Secure access to your banking dashboard
        </p>
      </div>
    </main>
  )
}
