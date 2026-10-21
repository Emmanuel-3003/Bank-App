import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { session, signOut } = useAuth()

  return (
    <header className="bg-slate-900 text-white shadow">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2 text-lg font-semibold">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-teal-600 font-bold">B</span>
          Bank
        </Link>

        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-slate-200 sm:inline">
            {session.firstName} {session.lastName}
          </span>
          <button
            onClick={signOut}
            className="rounded-md border border-white/20 px-3 py-1.5 text-sm hover:bg-white/10"
          >
            Log out
          </button>
        </div>
      </div>
    </header>
  )
}