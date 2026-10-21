import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getAccounts } from '../api/accounts'
import { useAuth } from '../context/AuthContext'
import StatusBadge from '../components/StatusBadge'
import { parseApiError } from '../utils/errors'
import { formatDate, formatMoney, titleCase } from '../utils/format'

export default function AccountDetail() {
  const { accountNumber } = useParams()
  const { session } = useAuth()
  const [account, setAccount] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      try {
        // The backend has no "get one account" endpoint, so find it in the customer's list.
        const data = await getAccounts(session.customerId, {
          pageNumber: 0,
          pageSize: 100,
          sortBy: 'id',
          sortOrder: 'asc',
        })
        const found = (data.content || []).find((item) => item.accountNumber === accountNumber)
        if (!cancelled) {
          setAccount(found || null)
          setError(found ? '' : 'That account was not found under your profile.')
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
  }, [session.customerId, accountNumber])

  if (loading) return <p className="text-slate-500">Loading account…</p>

  if (!account) {
    return (
      <>
        <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error || 'Account not found.'}
        </p>
        <Link to="/" className="mt-4 inline-block text-sm font-medium text-teal-700 hover:underline">
          Back to accounts
        </Link>
      </>
    )
  }

  return (
    <>
      <p className="mb-4 text-sm text-slate-500">
        <Link to="/" className="hover:text-teal-700 hover:underline">
          Accounts
        </Link>{' '}
        / {account.accountNumber}
      </p>

      <section className="flex flex-wrap items-start justify-between gap-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-slate-900">{account.accountName}</h1>
            <StatusBadge status={account.accountStatus} />
          </div>
          <p className="mt-1 text-sm text-slate-500">
            {account.accountNumber} · {titleCase(account.accountType)} · Opened{' '}
            {formatDate(account.dateOfOpening)}
          </p>
        </div>
        <div className="sm:text-right">
          <p className="text-xs uppercase tracking-wide text-slate-500">Balance</p>
          <p className="text-3xl font-semibold tabular-nums text-slate-900">
            {formatMoney(account.balance)}
          </p>
        </div>
      </section>
    </>
  )
}