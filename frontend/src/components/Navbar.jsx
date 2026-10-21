
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { session, signOut } = useAuth()

  const navLinkClass = ({ isActive }) =>
    `rounded-lg px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-teal-400 ${
      isActive
        ? 'bg-slate-800 text-teal-300'
        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
    }`

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950 text-white shadow-md">
      <div className="mx-auto flex min-h-16 max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">

        {/* Bank logo */}
        <Link
          to="/"
          className="flex shrink-0 items-center gap-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400"
          aria-label="Bank home"
        >
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-teal-500 text-lg font-bold shadow-sm shadow-teal-900/40">
            B
          </span>

          <span className="text-xl font-bold tracking-tight">
            Bank
          </span>
        </Link>

        {/* Main navigation */}
        <nav
          aria-label="Main navigation"
          className="order-3 flex w-full items-center gap-2 sm:order-none sm:w-auto"
        >
          <NavLink to="/" end className={navLinkClass}>
            Dashboard
          </NavLink>

          <NavLink to="/profile" className={navLinkClass}>
            My Profile
          </NavLink>
        </nav>

        {/* User information and logout */}
        <div className="flex min-w-0 items-center gap-3 sm:gap-5">
          <div className="hidden text-right sm:block">
            <p className="text-xs text-slate-400">
              Signed in as
            </p>

            <p className="max-w-48 truncate text-sm font-medium text-slate-100">
              {session?.firstName} {session?.lastName}
            </p>
          </div>

          <div className="hidden h-8 w-px bg-slate-700 sm:block" />

          <button
            type="button"
            onClick={signOut}
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:border-red-400/50 hover:bg-red-500/10 hover:text-red-300 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 focus:ring-offset-slate-950"
          >
            Log out
          </button>
        </div>

      </div>
    </header>
  )
}
