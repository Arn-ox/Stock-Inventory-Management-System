import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Navigation from './Navigation';

function Dashboard({ username, onLogout }) {
  const [stats, setStats] = useState({
    totalSpareParts: 0,
    totalStockIn: 0,
    totalStockOut: 0,
    lowStockItems: 0
  });

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const [sparePartsRes, stockInRes, stockOutRes] = await Promise.all([
        axios.get('/api/spare-parts'),
        axios.get('/api/stock-in'),
        axios.get('/api/stock-out')
      ]);

      const spareParts = sparePartsRes.data;
      const lowStock = spareParts.filter(item => item.Quantity < 10).length;

      setStats({
        totalSpareParts: spareParts.length,
        totalStockIn: stockInRes.data.length,
        totalStockOut: stockOutRes.data.length,
        lowStockItems: lowStock
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  const dashboardCards = [
    {
      title: 'Total Spare Parts',
      value: stats.totalSpareParts,
      link: '/spare-parts',
      color: 'bg-blue-600'
    },
    {
      title: 'Stock In Records',
      value: stats.totalStockIn,
      link: '/stock-in',
      color: 'bg-green-600'
    },
    {
      title: 'Stock Out Records',
      value: stats.totalStockOut,
      link: '/stock-out',
      color: 'bg-red-600'
    },
    {
      title: 'Low Stock Items',
      value: stats.lowStockItems,
      link: '/reports',
      color: 'bg-yellow-600'
    }
  ];

  return (
    <div className="min-h-screen bg-black">
      <Navigation username={username} onLogout={onLogout} />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-yellow-500 mb-2">
            SmartPark Stock Management System
          </h1>
          <p className="text-gray-300 text-lg">
            Efficient inventory management for automotive spare parts
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {dashboardCards.map((card, index) => (
            <Link
              key={index}
              to={card.link}
              className="block bg-gray-900 border border-gray-700 rounded-lg p-6 hover:border-yellow-500 transition duration-200"
            >
              <div className={`w-12 h-12 ${card.color} rounded-lg mb-4 flex items-center justify-center`}>
                <span className="text-white text-xl font-bold">{card.value}</span>
              </div>
              <h3 className="text-white text-lg font-semibold mb-2">{card.title}</h3>
              <p className="text-gray-400">Click to view details</p>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
            <h2 className="text-yellow-500 text-xl font-bold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link
                to="/spare-parts"
                className="block w-full bg-yellow-500 text-black py-2 px-4 rounded-md hover:bg-yellow-600 transition duration-200 text-center font-medium"
              >
                Add New Spare Part
              </Link>
              <Link
                to="/stock-in"
                className="block w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition duration-200 text-center font-medium"
              >
                Record Stock In
              </Link>
              <Link
                to="/stock-out"
                className="block w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition duration-200 text-center font-medium"
              >
                Record Stock Out
              </Link>
              <Link
                to="/reports"
                className="block w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-200 text-center font-medium"
              >
                View Reports
              </Link>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
            <h2 className="text-yellow-500 text-xl font-bold mb-4">System Information</h2>
            <div className="space-y-3 text-gray-300">
              <div className="flex justify-between">
                <span>Current User:</span>
                <span className="text-yellow-500">{username}</span>
              </div>
              <div className="flex justify-between">
                <span>System Status:</span>
                <span className="text-green-500">Online</span>
              </div>
              <div className="flex justify-between">
                <span>Last Updated:</span>
                <span>{new Date().toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Version:</span>
                <span>1.0.0</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
