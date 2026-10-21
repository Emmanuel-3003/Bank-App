
import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  getAccounts,
  updateAccountStatus,
} from '../api/accounts'
import {
  deposit,
  withdraw,
  transfer,
  getStatements,
} from '../api/transactions'
import { useAuth } from '../context/AuthContext'
import StatusBadge from '../components/StatusBadge'
import { parseApiError } from '../utils/errors'
import { formatDate, formatMoney, titleCase } from '../utils/format'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

export default function AccountDetail() {
  const { accountNumber } = useParams()
  const { session } = useAuth()

  const [account, setAccount] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [transactionType, setTransactionType] = useState('deposit')
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [toAccountNumber, setToAccountNumber] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [actionError, setActionError] = useState('')
  const [notice, setNotice] = useState('')

  const [closingAccount, setClosingAccount] = useState(false)
  const [closeAccountError, setCloseAccountError] = useState('')

  const [statement, setStatement] = useState(null)
  const [transactionsLoading, setTransactionsLoading] = useState(true)
  const [transactionsError, setTransactionsError] = useState('')
  const [transactionPage, setTransactionPage] = useState(0)

  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [appliedFromDate, setAppliedFromDate] = useState('')
  const [appliedToDate, setAppliedToDate] = useState('')

  const [selectedTransaction, setSelectedTransaction] = useState(null)

  const isClosed = account?.accountStatus === 'CLOSED'

  const loadAccount = useCallback(async () => {
    const data = await getAccounts(session.customerId, {
      pageNumber: 0,
      pageSize: 100,
      sortBy: 'id',
      sortOrder: 'asc',
    })

    const found = (data.content || []).find(
      (item) => item.accountNumber === accountNumber
    )

    setAccount(found || null)
    setError(found ? '' : 'That account was not found under your profile.')

    return found
  }, [session.customerId, accountNumber])

  const loadTransactions = useCallback(async () => {
    setTransactionsLoading(true)
    setTransactionsError('')

    try {
      const params = {
        pageNumber: transactionPage,
        pageSize: 10,
        sortBy: 'transactionTime',
        sortOrder: 'desc',
      }

      if (appliedFromDate) params.fromDate = appliedFromDate
      if (appliedToDate) params.toDate = appliedToDate

      const data = await getStatements(accountNumber, params)
      setStatement(data)
    } catch (err) {
      setTransactionsError(parseApiError(err))
    } finally {
      setTransactionsLoading(false)
    }
  }, [
    accountNumber,
    transactionPage,
    appliedFromDate,
    appliedToDate,
  ])

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError('')

      try {
        const data = await getAccounts(session.customerId, {
          pageNumber: 0,
          pageSize: 100,
          sortBy: 'id',
          sortOrder: 'asc',
        })

        if (cancelled) return

        const found = (data.content || []).find(
          (item) => item.accountNumber === accountNumber
        )

        setAccount(found || null)

        if (!found) {
          setError('That account was not found under your profile.')
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

  useEffect(() => {
    let cancelled = false

    async function load() {
      setTransactionsLoading(true)
      setTransactionsError('')

      try {
        const params = {
          pageNumber: transactionPage,
          pageSize: 10,
          sortBy: 'transactionTime',
          sortOrder: 'desc',
        }

        if (appliedFromDate) params.fromDate = appliedFromDate
        if (appliedToDate) params.toDate = appliedToDate

        const data = await getStatements(accountNumber, params)

        if (!cancelled) setStatement(data)
      } catch (err) {
        if (!cancelled) {
          setTransactionsError(parseApiError(err))
        }
      } finally {
        if (!cancelled) setTransactionsLoading(false)
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [
    accountNumber,
    transactionPage,
    appliedFromDate,
    appliedToDate,
  ])

  useEffect(() => {
    if (!selectedTransaction) return

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setSelectedTransaction(null)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [selectedTransaction])

  async function handleCloseAccount() {
    if (!account || isClosed || closingAccount || submitting) {
      return
    }

    const confirmed = window.confirm(
      `Are you sure you want to close account ${account.accountNumber}?\n\n` +
      'This action may not be reversible. Make sure the account meets ' +
      'your bank’s closure requirements before continuing.'
    )

    if (!confirmed) return

    setClosingAccount(true)
    setCloseAccountError('')
    setActionError('')
    setNotice('')

    try {
      const response = await updateAccountStatus(
        account.accountNumber,
        'CLOSED'
      )

      // Refresh the account using the backend's latest status.
      await loadAccount()

      setNotice(response?.message || 'Account closed successfully.')
    } catch (err) {
      setCloseAccountError(parseApiError(err))
    } finally {
      setClosingAccount(false)
    }
  }

  async function handleTransaction(event) {
    event.preventDefault()
    setActionError('')
    setNotice('')

    if (isClosed) {
      setActionError('Transactions are not allowed on a closed account.')
      return
    }

    const numericAmount = Number(amount)
    const trimmedNote = note.trim()
    const destination = toAccountNumber.trim()

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setActionError('Enter an amount greater than zero.')
      return
    }

    if (
      trimmedNote &&
      (trimmedNote.length < 5 || trimmedNote.length > 200)
    ) {
      setActionError('The note must contain 5 to 200 characters.')
      return
    }

    if (transactionType === 'transfer' && !destination) {
      setActionError('Enter the destination account number.')
      return
    }

    if (
      transactionType === 'transfer' &&
      destination === account.accountNumber
    ) {
      setActionError('The destination must be a different account.')
      return
    }

    setSubmitting(true)

    try {
      const payload = {
        amount: numericAmount,
        ...(trimmedNote ? { trxnNote: trimmedNote } : {}),
      }

      if (transactionType === 'deposit') {
        await deposit(account.accountNumber, payload)
        setNotice('Deposit completed successfully.')
      } else if (transactionType === 'withdraw') {
        await withdraw(account.accountNumber, payload)
        setNotice('Withdrawal completed successfully.')
      } else {
        await transfer({
          fromAccountNumber: account.accountNumber,
          toAccountNumber: destination,
          ...payload,
        })
        setNotice('Fund transfer completed successfully.')
      }

      setAmount('')
      setNote('')
      setToAccountNumber('')
      setTransactionPage(0)

      await loadAccount()
      await loadTransactions()
    } catch (err) {
      setActionError(parseApiError(err))
    } finally {
      setSubmitting(false)
    }
  }

  function applyDateFilters(event) {
    event.preventDefault()

    if (fromDate && toDate && fromDate > toDate) {
      setTransactionsError(
        'The start date cannot be later than the end date.'
      )
      return
    }

    setTransactionsError('')
    setTransactionPage(0)
    setAppliedFromDate(fromDate)
    setAppliedToDate(toDate)
  }

  function clearDateFilters() {
    setFromDate('')
    setToDate('')
    setAppliedFromDate('')
    setAppliedToDate('')
    setTransactionPage(0)
    setTransactionsError('')
  }

  function handleExportTransactions() {
    const transactions = statement?.transactions ?? []

    if (!transactions.length) {
      setTransactionsError('There are no transactions to export.')
      return
    }

    const headers = [
      'Transaction ID',
      'Date and Time',
      'Transaction Type',
      'Note',
      'Amount',
      'Balance After Transaction',
    ]

    const escapeCsv = (value) => {
      const text = String(value ?? '')
      return `"${text.replace(/"/g, '""')}"`
    }

    const rows = transactions.map((item) => [
      item.trxnId ?? item.id ?? '',
      item.transactionTime
        ? new Date(item.transactionTime).toLocaleString('en-IN')
        : '',
      item.transactionType ?? '',
      item.trxnNote ?? '',
      item.amount ?? '',
      item.balanceAfterTransaction ?? '',
    ])

    const csvContent = [headers, ...rows]
      .map((row) => row.map(escapeCsv).join(','))
      .join('\r\n')

    const blob = new Blob(
      ['\uFEFF' + csvContent],
      { type: 'text/csv;charset=utf-8;' }
    )

    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.download = `transactions-${account.accountNumber}.csv`

    document.body.appendChild(link)
    link.click()
    link.remove()

    URL.revokeObjectURL(url)
  }

  function handleExportPDF() {
    const transactions = statement?.transactions ?? []

    if (!transactions.length) {
      setTransactionsError('There are no transactions to export.')
      return
    }

    const doc = new jsPDF()

    doc.setFontSize(18)
    doc.text('Bank Account Statement', 14, 20)

    doc.setFontSize(11)
    doc.text(`Account Name: ${account.accountName || ''}`, 14, 32)
    doc.text(`Account Number: ${account.accountNumber}`, 14, 40)
    doc.text(`Account Type: ${titleCase(account.accountType || '')}`, 14, 48)
    doc.text(`Current Balance (INR): ${account.balance ?? ''}`, 14, 56)

    doc.setFontSize(10)
    doc.text(
      `Period: ${appliedFromDate || 'All dates'} to ${appliedToDate || 'All dates'}`,
      14,
      65
    )
    doc.text(`Generated: ${new Date().toLocaleString('en-IN')}`, 14, 71)

    autoTable(doc, {
      startY: 78,
      head: [[
        'Transaction ID',
        'Date and Time',
        'Type',
        'Note',
        'Amount (INR)',
        'Balance After (INR)',
      ]],
      body: transactions.map((item) => [
        item.trxnId ?? item.id ?? '',
        item.transactionTime
          ? new Date(item.transactionTime).toLocaleString('en-IN')
          : '',
        titleCase(item.transactionType || 'Unknown'),
        item.trxnNote ?? '',
        item.amount ?? '',
        item.balanceAfterTransaction ?? '',
      ]),
      styles: {
        fontSize: 8,
        cellPadding: 2,
        overflow: 'linebreak',
      },
      headStyles: {
        fillColor: [15, 118, 110],
      },
      columnStyles: {
        3: { cellWidth: 40 },
      },
    })

    doc.save(`statement-${account.accountNumber}.pdf`)
  }

  if (loading) {
    return <p className="text-slate-500">Loading account...</p>
  }

  if (!account) {
    return (
      <>
        <p
          role="alert"
          className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error || 'Account not found.'}
        </p>

        <Link
          to="/"
          className="mt-4 inline-block text-sm font-medium text-teal-700 hover:underline"
        >
          Back to accounts
        </Link>
      </>
    )
  }

  const transactions = statement?.transactions ?? []
  const totalPages = statement?.totalPages ?? 0

  const totalCredits = transactions.reduce((total, item) => {
    const type = (item.transactionType || '').toUpperCase()
    return ['CREDIT', 'DEPOSIT'].includes(type)
      ? total + Number(item.amount || 0)
      : total
  }, 0)

  const totalDebits = transactions.reduce((total, item) => {
    const type = (item.transactionType || '').toUpperCase()
    return ['DEBIT', 'WITHDRAWAL', 'WITHDRAW'].includes(type)
      ? total + Number(item.amount || 0)
      : total
  }, 0)

  const netMovement = totalCredits - totalDebits

  const formatTransactionDate = (date) =>
    date
      ? new Date(date).toLocaleString('en-IN', {
          dateStyle: 'medium',
          timeStyle: 'short',
        })
      : '—'

  const getTransactionId = (item, index) =>
    item.trxnId || `Transaction #${item.id ?? index + 1}`

  const getTransactionType = (item) =>
    (item.transactionType || '').toUpperCase()

  const isCreditTransaction = (item) =>
    ['CREDIT', 'DEPOSIT'].includes(getTransactionType(item))

  const isDebitTransaction = (item) =>
    ['DEBIT', 'WITHDRAWAL', 'WITHDRAW'].includes(getTransactionType(item))

  return (
    <>
      <p className="mb-4 text-sm text-slate-500">
        <Link to="/" className="hover:text-teal-700 hover:underline">
          Accounts
        </Link>{' '}
        / {account.accountNumber}
      </p>

      {notice && (
        <p
          role="status"
          className="mb-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700"
        >
          {notice}
        </p>
      )}

      {error && (
        <p
          role="alert"
          className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      {/* Account overview */}
      <section className="flex flex-wrap items-start justify-between gap-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold text-slate-900">
              {account.accountName}
            </h1>
            <StatusBadge status={account.accountStatus} />
          </div>

          <p className="mt-2 text-sm text-slate-500">
            {account.accountNumber} · {titleCase(account.accountType)}
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Opened {formatDate(account.dateOfOpening)}
          </p>
        </div>

        <div className="sm:text-right">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Available balance
          </p>
          <p className="mt-1 text-3xl font-semibold tabular-nums text-slate-900">
            {formatMoney(account.balance)}
          </p>
        </div>
      </section>

      {/* Account closure */}
      <section className="mt-6 rounded-xl border border-red-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">
          Account settings
        </h2>

        {isClosed ? (
          <p className="mt-3 rounded-lg bg-slate-100 px-4 py-3 text-sm text-slate-600">
            This account is closed. Money operations are unavailable.
          </p>
        ) : (
          <>
            <p className="mt-2 text-sm text-slate-600">
              Closing an account may be irreversible. Make sure you understand
              the bank's requirements before proceeding.
            </p>

            {closeAccountError && (
              <p
                role="alert"
                className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {closeAccountError}
              </p>
            )}

            <button
              type="button"
              onClick={handleCloseAccount}
              disabled={closingAccount || submitting}
              className="mt-4 rounded-lg border border-red-300 px-4 py-2.5 text-sm font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {closingAccount ? 'Closing account...' : 'Close account'}
            </button>
          </>
        )}
      </section>

      {/* Money management */}
      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">
          Manage money
        </h2>

        {isClosed && (
          <p className="mt-3 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
            This account is closed. Deposits, withdrawals, and transfers are disabled.
          </p>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          {[
            { value: 'deposit', label: 'Deposit' },
            { value: 'withdraw', label: 'Withdraw' },
            { value: 'transfer', label: 'Transfer' },
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              disabled={isClosed || submitting}
              onClick={() => {
                setTransactionType(option.value)
                setActionError('')
                setNotice('')
              }}
              className={`rounded-lg px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50 ${
                transactionType === option.value
                  ? 'bg-teal-700 text-white'
                  : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleTransaction} className="mt-5 max-w-lg space-y-4">
          {transactionType === 'transfer' && (
            <div>
              <label
                htmlFor="destinationAccount"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Destination account number
              </label>
              <input
                id="destinationAccount"
                type="text"
                value={toAccountNumber}
                onChange={(event) => setToAccountNumber(event.target.value)}
                required
                disabled={isClosed || submitting}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-100"
                placeholder="Enter recipient account number"
              />
            </div>
          )}

          <div>
            <label
              htmlFor="transactionAmount"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Amount (₹)
            </label>
            <input
              id="transactionAmount"
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              required
              disabled={isClosed || submitting}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-100"
              placeholder="Enter amount"
            />
          </div>

          <div>
            <label
              htmlFor="transactionNote"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Note (optional)
            </label>
            <input
              id="transactionNote"
              type="text"
              minLength={5}
              maxLength={200}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              disabled={isClosed || submitting}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-100"
              placeholder="At least 5 characters if provided"
            />
          </div>

          {actionError && (
            <p
              role="alert"
              className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
            >
              {actionError}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting || closingAccount || isClosed}
            className="rounded-lg bg-teal-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting
              ? 'Processing...'
              : transactionType === 'deposit'
                ? 'Confirm deposit'
                : transactionType === 'withdraw'
                  ? 'Confirm withdrawal'
                  : 'Confirm transfer'}
          </button>
        </form>
      </section>

      {/* Transaction history */}
      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Transaction history
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              View and filter your account transactions
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleExportTransactions}
              disabled={transactionsLoading || transactions.length === 0}
              className="rounded-lg bg-teal-700 px-3 py-2 text-sm font-medium text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Export CSV
            </button>

            <button
              type="button"
              onClick={handleExportPDF}
              disabled={transactionsLoading || transactions.length === 0}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Download PDF
            </button>

            <button
              type="button"
              onClick={loadTransactions}
              disabled={transactionsLoading}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Refresh
            </button>
          </div>
        </div>

        <form
          onSubmit={applyDateFilters}
          className="mt-5 flex flex-wrap items-end gap-4"
        >
          <div>
            <label
              htmlFor="fromDate"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              From date
            </label>
            <input
              id="fromDate"
              type="date"
              value={fromDate}
              max={toDate || undefined}
              onChange={(event) => setFromDate(event.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label
              htmlFor="toDate"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              To date
            </label>
            <input
              id="toDate"
              type="date"
              value={toDate}
              min={fromDate || undefined}
              onChange={(event) => setToDate(event.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <button
            type="submit"
            className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800"
          >
            Apply filters
          </button>

          <button
            type="button"
            onClick={clearDateFilters}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Clear filters
          </button>
        </form>

        {/* Transaction summary */}
        {!transactionsLoading &&
          !transactionsError &&
          transactions.length > 0 && (
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-lg border border-slate-200 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Total credits
                </p>
                <p className="mt-2 text-lg font-semibold text-green-700">
                  {formatMoney(totalCredits)}
                </p>
              </div>

              <div className="rounded-lg border border-slate-200 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Total debits
                </p>
                <p className="mt-2 text-lg font-semibold text-red-700">
                  {formatMoney(totalDebits)}
                </p>
              </div>

              <div className="rounded-lg border border-slate-200 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Net movement
                </p>
                <p
                  className={`mt-2 text-lg font-semibold ${
                    netMovement >= 0 ? 'text-green-700' : 'text-red-700'
                  }`}
                >
                  {formatMoney(netMovement)}
                </p>
              </div>

              <div className="rounded-lg border border-slate-200 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Transactions on page
                </p>
                <p className="mt-2 text-lg font-semibold text-slate-900">
                  {transactions.length}
                </p>
              </div>
            </div>
          )}

        {transactionsLoading ? (
          <p className="mt-5 text-sm text-slate-500">
            Loading transactions...
          </p>
        ) : transactionsError ? (
          <p
            role="alert"
            className="mt-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {transactionsError}
          </p>
        ) : transactions.length === 0 ? (
          <p className="mt-5 rounded-lg bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
            No transactions found for the selected dates.
          </p>
        ) : (
          <>
            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[800px] text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Transaction</th>
                    <th className="px-4 py-3 font-medium">Type</th>
                    <th className="px-4 py-3 font-medium">Note</th>
                    <th className="px-4 py-3 text-right font-medium">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-right font-medium">
                      Balance after
                    </th>
                    <th className="px-4 py-3 text-right font-medium">
                      Details
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {transactions.map((item, index) => {
                    const isCredit = isCreditTransaction(item)
                    const isDebit = isDebitTransaction(item)

                    return (
                      <tr
                        key={item.id ?? item.trxnId ?? index}
                        className="hover:bg-slate-50"
                      >
                        <td className="px-4 py-4">
                          <p className="font-medium text-slate-800">
                            {getTransactionId(item, index)}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {formatTransactionDate(item.transactionTime)}
                          </p>
                        </td>

                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                              isCredit
                                ? 'bg-green-50 text-green-700'
                                : isDebit
                                  ? 'bg-red-50 text-red-700'
                                  : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {titleCase(item.transactionType || 'Unknown')}
                          </span>
                        </td>

                        <td className="max-w-48 whitespace-normal px-4 py-4 text-slate-600">
                          {item.trxnNote || '—'}
                        </td>

                        <td
                          className={`whitespace-nowrap px-4 py-4 text-right font-semibold tabular-nums ${
                            isCredit
                              ? 'text-green-700'
                              : isDebit
                                ? 'text-red-700'
                                : 'text-slate-700'
                          }`}
                        >
                          {isCredit ? '+' : isDebit ? '−' : ''}
                          {formatMoney(item.amount)}
                        </td>

                        <td className="whitespace-nowrap px-4 py-4 text-right tabular-nums text-slate-700">
                          {item.balanceAfterTransaction != null
                            ? formatMoney(item.balanceAfterTransaction)
                            : '—'}
                        </td>

                        <td className="px-4 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedTransaction(item)}
                            className="whitespace-nowrap text-sm font-medium text-teal-700 hover:text-teal-900 hover:underline"
                            aria-label={`View details for ${getTransactionId(item, index)}`}
                          >
                            View details
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
              <p className="text-sm text-slate-500">
                Page {transactionPage + 1} of {Math.max(totalPages, 1)}
                {' · '}
                {statement?.totalElements ?? transactions.length} transactions
              </p>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setTransactionPage((page) => Math.max(0, page - 1))
                  }
                  disabled={transactionPage === 0 || transactionsLoading}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>

                <button
                  type="button"
                  onClick={() => setTransactionPage((page) => page + 1)}
                  disabled={
                    transactionsLoading ||
                    totalPages === 0 ||
                    transactionPage >= totalPages - 1
                  }
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </section>

      {/* Transaction details modal */}
      {selectedTransaction && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedTransaction(null)
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="transaction-modal-title"
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2
                  id="transaction-modal-title"
                  className="text-xl font-semibold text-slate-900"
                >
                  Transaction details
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Full information for this transaction
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedTransaction(null)}
                className="rounded-lg p-2 text-xl leading-none text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                aria-label="Close transaction details"
              >
                ×
              </button>
            </div>

            <div className="mt-6 rounded-xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">
                Transaction amount
              </p>
              <p
                className={`mt-1 text-2xl font-semibold tabular-nums ${
                  isCreditTransaction(selectedTransaction)
                    ? 'text-green-700'
                    : isDebitTransaction(selectedTransaction)
                      ? 'text-red-700'
                      : 'text-slate-900'
                }`}
              >
                {isCreditTransaction(selectedTransaction)
                  ? '+'
                  : isDebitTransaction(selectedTransaction)
                    ? '−'
                    : ''}
                {formatMoney(selectedTransaction.amount)}
              </p>

              <span
                className={`mt-3 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                  isCreditTransaction(selectedTransaction)
                    ? 'bg-green-100 text-green-700'
                    : isDebitTransaction(selectedTransaction)
                      ? 'bg-red-100 text-red-700'
                      : 'bg-slate-200 text-slate-700'
                }`}
              >
                {titleCase(selectedTransaction.transactionType || 'Unknown')}
              </span>
            </div>

            <dl className="mt-5 divide-y divide-slate-100">
              <div className="flex flex-col gap-1 py-3 sm:flex-row sm:justify-between sm:gap-4">
                <dt className="text-sm text-slate-500">Transaction ID</dt>
                <dd className="break-all text-sm font-medium text-slate-900 sm:text-right">
                  {selectedTransaction.trxnId ??
                    selectedTransaction.id ??
                    '—'}
                </dd>
              </div>

              <div className="flex flex-col gap-1 py-3 sm:flex-row sm:justify-between sm:gap-4">
                <dt className="text-sm text-slate-500">Date and time</dt>
                <dd className="text-sm font-medium text-slate-900 sm:text-right">
                  {formatTransactionDate(
                    selectedTransaction.transactionTime
                  )}
                </dd>
              </div>

              <div className="flex flex-col gap-1 py-3 sm:flex-row sm:justify-between sm:gap-4">
                <dt className="text-sm text-slate-500">Account number</dt>
                <dd className="break-all text-sm font-medium text-slate-900 sm:text-right">
                  {account.accountNumber}
                </dd>
              </div>

              <div className="flex flex-col gap-1 py-3 sm:flex-row sm:justify-between sm:gap-4">
                <dt className="text-sm text-slate-500">Note</dt>
                <dd className="whitespace-pre-wrap break-words text-sm font-medium text-slate-900 sm:max-w-[65%] sm:text-right">
                  {selectedTransaction.trxnNote || 'No note provided'}
                </dd>
              </div>

              <div className="flex flex-col gap-1 py-3 sm:flex-row sm:justify-between sm:gap-4">
                <dt className="text-sm text-slate-500">
                  Balance after transaction
                </dt>
                <dd className="text-sm font-semibold tabular-nums text-slate-900 sm:text-right">
                  {selectedTransaction.balanceAfterTransaction != null
                    ? formatMoney(
                        selectedTransaction.balanceAfterTransaction
                      )
                    : 'Not available'}
                </dd>
              </div>
            </dl>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedTransaction(null)}
                className="rounded-lg bg-teal-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-teal-800"
              >
                Close
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  )
}
