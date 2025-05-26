import { Link, useLocation } from 'react-router-dom';

function Navigation({ username, onLogout }) {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard' },
    { path: '/spare-parts', label: 'Spare Parts' },
    { path: '/stock-in', label: 'Stock In' },
    { path: '/stock-out', label: 'Stock Out' },
    { path: '/reports', label: 'Reports' }
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-gray-900 border-b border-yellow-500">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <div className="text-yellow-500 text-xl font-bold">
              SmartPark SIMS
            </div>
            
            <div className="hidden md:flex space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition duration-200 ${
                    isActive(item.path)
                      ? 'bg-yellow-500 text-black'
                      : 'text-gray-300 hover:text-yellow-500 hover:bg-gray-800'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-gray-300">Welcome, {username}</span>
            <button
              onClick={onLogout}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition duration-200"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div className="md:hidden pb-4">
          <div className="flex flex-wrap gap-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 rounded-md text-sm font-medium transition duration-200 ${
                  isActive(item.path)
                    ? 'bg-yellow-500 text-black'
                    : 'text-gray-300 hover:text-yellow-500 hover:bg-gray-800'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;
