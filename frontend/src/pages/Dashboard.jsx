import { useEffect, useState } from 'react'
import { getAccounts, openAccount } from '../api/accounts'
import { useAuth } from '../context/AuthContext'
import AccountCard from '../components/AccountCard'
import Field from '../components/Field'
import { parseApiError } from '../utils/errors'
import { formatMoney } from '../utils/format'

const ACCOUNT_TYPES = [
  { value: 'SAVINGS', label: 'Savings' },
  { value: 'CURRENT', label: 'Current' },
]

const EMPTY_FORM = { accountName: '', accountType: 'SAVINGS' }

function Stat({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums text-slate-900">{value}</p>
    </div>
  )
}

export default function Dashboard() {
  const { session } = useAuth()
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [notice, setNotice] = useState('')

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const data = await getAccounts(session.customerId, {
          pageNumber: 0,
          pageSize: 100,
          sortBy: 'id',
          sortOrder: 'asc',
        })
        if (!cancelled) {
          setAccounts(data.content || [])
          setError('')
        }
      } catch (err) {
        if (!cancelled) setError(parseApiError(err))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [session.customerId, refreshKey])

  async function handleOpenAccount(event) {
    event.preventDefault()
    setFormError('')

    if (form.accountName.trim().length < 3) {
      setFormError('Account name must be at least 3 characters.')
      return
    }

    setSubmitting(true)
    try {
      const created = await openAccount(session.customerId, {
        accountName: form.accountName.trim(),
        accountType: form.accountType,
      })
      setNotice(`Account ${created.accountNumber} is open and ready to use.`)
      setForm(EMPTY_FORM)
      setShowForm(false)
      setRefreshKey((key) => key + 1)
    } catch (err) {
      setFormError(parseApiError(err))
    } finally {
      setSubmitting(false)
    }
  }

  const openAccounts = accounts.filter((account) => account.accountStatus !== 'CLOSED')
  const totalBalance = openAccounts.reduce((sum, account) => sum + Number(account.balance || 0), 0)

  if (loading) return <p className="text-slate-500">Loading your accounts…</p>

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Hello, {session.firstName}</h1>
          <p className="mt-1 text-slate-500">Here is where your money stands today.</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setShowForm((open) => !open)
            setFormError('')
          }}
          className="rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-teal-800"
        >
          {showForm ? 'Cancel' : 'Open new account'}
        </button>
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {notice && (
        <div
          role="status"
          className="mt-4 flex items-start justify-between gap-3 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
        >
          <span>{notice}</span>
          <button
            type="button"
            onClick={() => setNotice('')}
            aria-label="Dismiss message"
            className="leading-none opacity-60 hover:opacity-100"
          >
            ×
          </button>
        </div>
      )}

      <section className="mt-6 grid gap-4 sm:grid-cols-3">
        <Stat label="Total balance" value={formatMoney(totalBalance)} />
        <Stat label="Open accounts" value={openAccounts.length} />
        <Stat label="All accounts" value={accounts.length} />
      </section>

      {showForm && (
        <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-semibold text-slate-900">Open a new account</h2>

          {formError && (
            <p role="alert" className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {formError}
            </p>
          )}

          <form onSubmit={handleOpenAccount} noValidate className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field
              label="Account name"
              name="accountName"
              hint="At least 3 characters, for example Emergency fund."
              value={form.accountName}
              onChange={(event) => setForm((current) => ({ ...current, accountName: event.target.value }))}
              maxLength={50}
              autoFocus
            />
            <Field
              label="Account type"
              name="accountType"
              options={ACCOUNT_TYPES}
              value={form.accountType}
              onChange={(event) => setForm((current) => ({ ...current, accountType: event.target.value }))}
            />
            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={submitting}
                className="rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-teal-800 disabled:opacity-60"
              >
                {submitting ? 'Opening…' : 'Open account'}
              </button>
            </div>
          </form>
        </section>
      )}

      <h2 className="mb-4 mt-10 text-lg font-semibold text-slate-900">Your accounts</h2>
      {accounts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
          You do not have any accounts yet.
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {accounts.map((account) => (
            <AccountCard key={account.accountNumber} account={account} />
          ))}
        </div>
      )}
    </>
  )
}