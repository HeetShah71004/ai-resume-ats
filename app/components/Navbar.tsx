import { Link } from "react-router";
import { usePuterStore } from "~/lib/puter";
import { useState } from "react";

interface FSItem {
  id: string;
  name: string;
  path: string;
  is_dir: boolean;
}

const Navbar = () => {
  const { auth, isLoading } = usePuterStore();
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setShowDropdown(false);
    try {
      await auth.signOut();
      window.location.href = "/";
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleWipeData = () => {
    setShowDropdown(false);
    // Navigate to the wipe page for proper confirmation flow
    window.location.href = "/wipe";
  };

  return (
    <nav className="navbar">
      <Link to="/">
        <p className="text-2xl font-bold text-gradient">RESUMERX</p>
      </Link>
      <div className="flex flex-row gap-4 items-center">
        <Link to="/upload" className="primary-button w-fit">
          Upload Resume
        </Link>
        {auth.isAuthenticated && !isLoading && (
          <div className="relative">
            <button
              className="user-menu-button"
              onClick={() => setShowDropdown(!showDropdown)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
            >
              <span>{auth.user?.username}</span>
              <svg
                className={`w-4 h-4 transform transition-transform ${showDropdown ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {showDropdown && (
              <div className="dropdown-menu">
                <button
                  className="dropdown-item logout-item"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                >
                  {isLoggingOut ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Logging out...
                    </span>
                  ) : (
                    <>
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      Logout
                    </>
                  )}
                </button>
                <button
                  className="dropdown-item wipe-item"
                  onClick={handleWipeData}
                  disabled={isLoggingOut}
                >
                  <>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    ⚠️ Wipe All Data
                  </>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};
export default Navbar;
