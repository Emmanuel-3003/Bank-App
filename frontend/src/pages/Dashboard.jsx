import { useAuth } from '../context/AuthContext'

export default function Dashboard() {
  const { session, signOut } = useAuth()

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold">Hello, {session.firstName}</h1>
      <button
        onClick={signOut}
        className="mt-4 rounded bg-slate-900 px-4 py-2 text-white"
      >
        Log out
      </button>
    </div>
  )
}