
import { useEffect, useMemo, useState } from 'react'
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
    <div className="rounded-xl border border-slate-200 border-l-4 border-l-teal-600 bg-white p-6 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
        {label}
      </p>

      <p className="mt-2 break-words text-3xl font-semibold tracking-tight tabular-nums text-slate-900">
        {value}
      </p>
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

  // Account search and filters
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)

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
        if (!cancelled) {
          setError(
            parseApiError(err) || 'Unable to load your accounts.'
          )
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
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
    setNotice('')

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

      setNotice(
        `Account ${created.accountNumber} is open and ready to use.`
      )
      setForm(EMPTY_FORM)
      setShowForm(false)
      setSearchTerm('')
      setTypeFilter('ALL')
      setStatusFilter('ALL')
      setRefreshKey((key) => key + 1)
    } catch (err) {
      setFormError(
        parseApiError(err) || 'Unable to open the account.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  const openAccounts = accounts.filter(
    (account) => account.accountStatus !== 'CLOSED'
  )

  const totalBalance = openAccounts.reduce(
    (sum, account) => sum + Number(account.balance || 0),
    0
  )

  const filteredAccounts = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()

    return accounts.filter((account) => {
      const matchesSearch =
        !query ||
        String(account.accountName || '').toLowerCase().includes(query) ||
        String(account.accountNumber || '').toLowerCase().includes(query)

      const matchesType =
        typeFilter === 'ALL' || account.accountType === typeFilter

      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'OPEN' && account.accountStatus !== 'CLOSED') ||
        (statusFilter === 'CLOSED' && account.accountStatus === 'CLOSED')

      return matchesSearch && matchesType && matchesStatus
    })
  }, [accounts, searchTerm, typeFilter, statusFilter])

  function resetFilters() {
    setSearchTerm('')
    setTypeFilter('ALL')
    setStatusFilter('ALL')
  }

  const hasActiveFilters =
    searchTerm.trim() !== '' ||
    typeFilter !== 'ALL' ||
    statusFilter !== 'ALL'

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <p className="text-sm font-medium text-slate-500">
          Loading your accounts…
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      {/* Dashboard heading */}
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium text-teal-700">
            BANKING OVERVIEW
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Hello, {session.firstName}
          </h1>

          <p className="mt-2 text-sm text-slate-500 sm:text-base">
            Here is where your money stands today.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setShowForm((open) => !open)
            setFormError('')
            setNotice('')
          }}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-700 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2"
          aria-expanded={showForm}
        >
          <span aria-hidden="true" className="text-lg leading-none">
            {showForm ? '−' : '+'}
          </span>
          {showForm ? 'Cancel' : 'Open new account'}
        </button>
      </section>

      {/* API error */}
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <p>{error}</p>
          <button
            type="button"
            onClick={() => setRefreshKey((key) => key + 1)}
            className="mt-2 font-semibold underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Success notification */}
      {notice && (
        <div
          role="status"
          className="flex items-start justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
        >
          <span>{notice}</span>

          <button
            type="button"
            onClick={() => setNotice('')}
            aria-label="Dismiss message"
            className="text-lg leading-none opacity-60 hover:opacity-100"
          >
            ×
          </button>
        </div>
      )}

      {/* Summary cards */}
      <section
        aria-label="Account summary"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
      >
        <Stat label="Total balance" value={formatMoney(totalBalance)} />
        <Stat label="Open accounts" value={openAccounts.length} />
        <Stat label="All accounts" value={accounts.length} />
      </section>

      {/* Open account form */}
      {showForm && (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 bg-slate-50 px-5 py-4 sm:px-6">
            <h2 className="text-lg font-semibold text-slate-900">
              Open a new account
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Give your account a name and choose the account type.
            </p>
          </div>

          <div className="p-5 sm:p-6">
            {formError && (
              <p
                role="alert"
                className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {formError}
              </p>
            )}

            <form
              onSubmit={handleOpenAccount}
              noValidate
              className="grid grid-cols-1 gap-5 sm:grid-cols-2"
            >
              <Field
                label="Account name"
                name="accountName"
                hint="At least 3 characters, for example Emergency fund."
                value={form.accountName}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    accountName: event.target.value,
                  }))
                }
                maxLength={50}
                autoFocus
              />

              <Field
                label="Account type"
                name="accountType"
                options={ACCOUNT_TYPES}
                value={form.accountType}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    accountType: event.target.value,
                  }))
                }
              />

              <div className="flex flex-wrap gap-3 sm:col-span-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center justify-center rounded-lg bg-teal-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? 'Opening…' : 'Open account'}
                </button>

                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => {
                    setShowForm(false)
                    setFormError('')
                    setForm(EMPTY_FORM)
                  }}
                  className="rounded-lg border border-slate-300 px-5 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-60"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </section>
      )}

      {/* Account list and filters */}
      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Your accounts
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Search and filter your accounts.
            </p>
          </div>

          <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600">
            {filteredAccounts.length} of {accounts.length} accounts
          </span>
        </div>

        {/* Search and filter controls */}
        <div className="mb-5 grid grid-cols-1 gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label
              htmlFor="account-search"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Search accounts
            </label>

            <input
              id="account-search"
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Name or account number"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
            />
          </div>

          <div>
            <label
              htmlFor="account-type-filter"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Account type
            </label>

            <select
              id="account-type-filter"
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
            >
              <option value="ALL">All types</option>
              <option value="SAVINGS">Savings</option>
              <option value="CURRENT">Current</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="account-status-filter"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Account status
            </label>

            <select
              id="account-status-filter"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
            >
              <option value="ALL">All statuses</option>
              <option value="OPEN">Open</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={resetFilters}
              disabled={!hasActiveFilters}
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Reset filters
            </button>
          </div>
        </div>

        {accounts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center">
            <h3 className="text-base font-semibold text-slate-900">
              No accounts yet
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Open your first account to get started.
            </p>

            <button
              type="button"
              onClick={() => {
                setShowForm(true)
                setFormError('')
              }}
              className="mt-5 rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-teal-800"
            >
              Open your first account
            </button>
          </div>
        ) : filteredAccounts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center">
            <h3 className="text-base font-semibold text-slate-900">
              No matching accounts
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Try a different search term or change your filters.
            </p>

            <button
              type="button"
              onClick={resetFilters}
              className="mt-5 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 items-stretch gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filteredAccounts.map((account) => (
              <AccountCard
                key={account.accountNumber}
                account={account}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
