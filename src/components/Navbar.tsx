import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { isAuthenticated, email, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <header className="border-b border-gray-200 bg-white">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="text-lg font-semibold text-gray-900">
          Ecom Admin
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <Link to="/" className="text-gray-600 hover:text-gray-900">
            Products
          </Link>
          {isAuthenticated && (
            <Link to="/products/new" className="text-gray-600 hover:text-gray-900">
              New Product
            </Link>
          )}
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              {email && <span className="text-gray-500">{email}</span>}
              <button
                onClick={handleLogout}
                className="rounded-md bg-gray-100 px-3 py-1.5 font-medium text-gray-700 hover:bg-gray-200"
              >
                Log out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="rounded-md px-3 py-1.5 font-medium text-gray-700 hover:bg-gray-100"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="rounded-md bg-gray-900 px-3 py-1.5 font-medium text-white hover:bg-gray-700"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  )
}
