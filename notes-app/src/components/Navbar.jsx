import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { FaHome, FaFolder } from "react-icons/fa";
import { getAuthToken, signout } from "../services/authsservice";

// Styles for active and normal links
const activeLink = "flex items-center gap-2 border-b-2 border-blue-600 text-blue-600 font-medium";
const normalLink = "flex items-center gap-2 border-b-2 border-transparent text-gray-600 hover:text-blue-600";

function Navbar() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(getAuthToken()));

  useEffect(() => {
    const syncAuth = () => setIsAuthenticated(Boolean(getAuthToken()));
    window.addEventListener("auth-change", syncAuth);
    window.addEventListener("storage", syncAuth);
    return () => {
      window.removeEventListener("auth-change", syncAuth);
      window.removeEventListener("storage", syncAuth);
    };
  }, []);

  const handleSignout = () => {
    signout();
    navigate("/login");
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Left side: Logo + Links */}
        <div className="flex items-center gap-10">
          <h1 className="text-2xl font-bold text-blue-600">Notes App</h1>

          <div className="flex gap-4 h-16 text-sm">
            {/* NavLink tells us if the link is active (isActive) */}
            <NavLink
              to="/"
              className={({ isActive }) => (isActive ? activeLink : normalLink)}
            >
              <FaHome /> Home
            </NavLink>

            {isAuthenticated && (
              <NavLink to="/cat" className={({ isActive }) => (isActive ? activeLink : normalLink)}>
                <FaFolder />Category
              </NavLink>
            )}
          </div>
        </div>

        {/* Right side: User */}
        <div className="flex items-center gap-4 text-sm">
          {isAuthenticated ? (
            <button type="button" onClick={handleSignout} className="font-medium text-slate-700 hover:text-blue-700">
              Sign out
            </button>
          ) : (
            <>
              <NavLink to="/login" className="font-medium text-slate-700 hover:text-blue-700">Sign in</NavLink>
              <NavLink to="/signup" className="rounded-lg bg-blue-600 px-3 py-2 font-medium text-white hover:bg-blue-700">
                Sign up
              </NavLink>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
