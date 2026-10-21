
import { useEffect, useState } from 'react'
import client from '../api/client'
import { parseApiError } from '../utils/errors'

const initialForm = {
  firstName: '',
  lastName: '',
  email: '',
  dateOfBirth: '',
  address: '',
  city: '',
  state: '',
  country: '',
  pinCode: '',
}

const fields = [
  { name: 'firstName', label: 'First Name', required: true },
  { name: 'lastName', label: 'Last Name', required: true },
  { name: 'email', label: 'Email Address', type: 'email', required: true },
  { name: 'dateOfBirth', label: 'Date of Birth', type: 'date' },
  { name: 'address', label: 'Address' },
  { name: 'city', label: 'City' },
  { name: 'state', label: 'State' },
  { name: 'country', label: 'Country' },
  { name: 'pinCode', label: 'PIN Code' },
]

export default function MyProfile() {
  const [profile, setProfile] = useState(null)
  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    let active = true

    async function loadProfile() {
      setLoading(true)
      setError('')

      try {
        const response = await client.get('/customers/me')

        if (!active) return

        const customer = response.data

        setProfile(customer)
        setForm({
          ...initialForm,
          ...customer,
          dateOfBirth: customer.dateOfBirth || '',
        })
      } catch (err) {
        if (active) {
          setError(
            parseApiError(err) || 'Unable to load your profile.'
          )
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    loadProfile()

    return () => {
      active = false
    }
  }, [])

  function handleChange(event) {
    const { name, value } = event.target

    setForm((current) => ({
      ...current,
      [name]: value,
    }))

    setSuccess('')
  }

  function cancelEditing() {
    setForm({
      ...initialForm,
      ...profile,
      dateOfBirth: profile?.dateOfBirth || '',
    })

    setEditing(false)
    setError('')
    setSuccess('')
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!profile?.id) {
      setError('Customer ID is missing. Unable to update your profile.')
      return
    }

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const payload = {
        ...form,
        id: profile.id,
      }

      const response = await client.put(
        `/customers/${profile.id}`,
        payload
      )

      const updatedProfile = response.data

      setProfile(updatedProfile)
      setForm({
        ...initialForm,
        ...updatedProfile,
        dateOfBirth: updatedProfile.dateOfBirth || '',
      })

      setEditing(false)
      setSuccess('Your profile has been updated successfully.')
    } catch (err) {
      setError(
        parseApiError(err) || 'Unable to update your profile.'
      )
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-sm text-slate-500">
          Loading your profile...
        </p>
      </div>
    )
  }

  if (!profile && error) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </div>

        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium text-indigo-600">
            Account Settings
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            My Profile
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            View and manage your personal information.
          </p>
        </div>

        {!editing && (
          <button
            type="button"
            onClick={() => {
              setEditing(true)
              setError('')
              setSuccess('')
            }}
            className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            Edit Profile
          </button>
        )}
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {success && (
        <div
          role="status"
          className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700"
        >
          {success}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-slate-50 p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 text-xl font-bold text-indigo-700">
              {profile?.firstName?.charAt(0)?.toUpperCase() || 'U'}
              {profile?.lastName?.charAt(0)?.toUpperCase() || ''}
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                {[profile?.firstName, profile?.lastName]
                  .filter(Boolean)
                  .join(' ') || 'Customer'}
              </h2>

              <p className="text-sm text-slate-500">
                {profile?.email}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Customer ID: {profile?.id ?? 'N/A'}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {fields.map((field) => (
              <div
                key={field.name}
                className={
                  field.name === 'address' ? 'sm:col-span-2' : ''
                }
              >
                <label
                  htmlFor={field.name}
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  {field.label}
                  {field.required && (
                    <span className="ml-1 text-red-500">*</span>
                  )}
                </label>

                {editing ? (
                  <input
                    id={field.name}
                    name={field.name}
                    type={field.type || 'text'}
                    value={form[field.name] ?? ''}
                    onChange={handleChange}
                    required={field.required || false}
                    maxLength={field.name === 'pinCode' ? 20 : undefined}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                ) : (
                  <div className="min-h-11 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-800">
                    {form[field.name] || (
                      <span className="text-slate-400">
                        Not provided
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {editing && (
            <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={cancelEditing}
                disabled={saving}
                className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
