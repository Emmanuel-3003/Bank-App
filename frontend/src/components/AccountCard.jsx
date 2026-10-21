
import { Link } from 'react-router-dom'
import StatusBadge from './StatusBadge'
import { formatDate, formatMoney, titleCase } from '../utils/format'

export default function AccountCard({ account }) {
  const closed = account.accountStatus === 'CLOSED'

  return (
    <article
      className={`group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-teal-200 hover:shadow-lg ${
        closed ? 'opacity-70' : ''
      }`}
    >
      {/* Account name and status */}
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-lg font-semibold text-slate-900">
            {account.accountName}
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Account No. {account.accountNumber}
          </p>
        </div>

        <StatusBadge status={account.accountStatus} />
      </header>

      {/* Account balance */}
      <div className="mt-6 rounded-xl bg-slate-50 p-4 transition-colors duration-200 group-hover:bg-teal-50">
        <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
          Available balance
        </p>

        <p className="mt-2 break-words text-2xl font-bold tracking-tight tabular-nums text-slate-900">
          {formatMoney(account.balance)}
        </p>
      </div>

      {/* Account information */}
      <dl className="mt-5 grid grid-cols-2 gap-4">
        <div>
          <dt className="text-xs font-medium uppercase tracking-wider text-slate-500">
            Account type
          </dt>

          <dd className="mt-1 text-sm font-semibold text-slate-800">
            {titleCase(account.accountType)}
          </dd>
        </div>

        <div>
          <dt className="text-xs font-medium uppercase tracking-wider text-slate-500">
            Opened on
          </dt>

          <dd className="mt-1 text-sm font-semibold text-slate-800">
            {formatDate(account.dateOfOpening)}
          </dd>
        </div>
      </dl>

      {/* Manage account */}
      <div className="mt-auto pt-6">
        <Link
          to={`/accounts/${account.accountNumber}`}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2"
        >
          Manage account
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </article>
  )
}
