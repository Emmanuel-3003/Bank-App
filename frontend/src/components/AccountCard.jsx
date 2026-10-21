import { Link } from 'react-router-dom'
import StatusBadge from './StatusBadge'
import { formatDate, formatMoney, titleCase } from '../utils/format'

export default function AccountCard({ account }) {
  const closed = account.accountStatus === 'CLOSED'

  return (
    <article
      className={`flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm ${
        closed ? 'opacity-70' : ''
      }`}
    >
      <header className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-slate-900">{account.accountName}</h3>
          <p className="text-sm text-slate-500">{account.accountNumber}</p>
        </div>
        <StatusBadge status={account.accountStatus} />
      </header>

      <p className="mt-5 text-xs uppercase tracking-wide text-slate-500">Balance</p>
      <p className="text-2xl font-semibold tabular-nums text-slate-900">
        {formatMoney(account.balance)}
      </p>

      <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 text-sm">
        <div>
          <dt className="text-xs uppercase tracking-wide text-slate-500">Type</dt>
          <dd className="font-medium text-slate-800">{titleCase(account.accountType)}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-slate-500">Opened</dt>
          <dd className="font-medium text-slate-800">{formatDate(account.dateOfOpening)}</dd>
        </div>
      </dl>

      <Link
        to={`/accounts/${account.accountNumber}`}
        className="mt-5 inline-flex w-fit rounded-lg bg-teal-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-teal-800"
      >
        Manage
      </Link>
    </article>
  )
}