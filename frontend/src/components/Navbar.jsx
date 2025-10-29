import { useState } from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="bg-black shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center">
              <span className="text-white font-bold text-xl">Bolt AI</span>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-900 focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            <Link
              to="/predictor"
              className="text-gray-300 hover:bg-gray-900 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
            >
              Predictor
            </Link>
            <Link
              to="/dashboard"
              className="text-gray-300 hover:bg-gray-900 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
            >
              Dashboard
            </Link>
          </div>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link
                to="/predictor"
                className="text-gray-300 hover:bg-gray-900 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
                onClick={toggleMenu}
              >
                Predictor
              </Link>
              <Link
                to="/dashboard"
                className="text-gray-300 hover:bg-gray-900 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
                onClick={toggleMenu}
              >
                Dashboard
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;