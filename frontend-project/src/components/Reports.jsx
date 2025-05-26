import { useState, useEffect } from 'react';
import axios from 'axios';
import Navigation from './Navigation';

function Reports({ username, onLogout }) {
  const [dailyStockOut, setDailyStockOut] = useState([]);
  const [stockStatus, setStockStatus] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [activeTab, setActiveTab] = useState('daily');

  useEffect(() => {
    fetchDailyStockOut();
    fetchStockStatus();
  }, [selectedDate]);

  const fetchDailyStockOut = async () => {
    try {
      const response = await axios.get(`/api/reports/daily-stock-out?date=${selectedDate}`);
      setDailyStockOut(response.data);
    } catch (error) {
      console.error('Error fetching daily stock out report:', error);
    }
  };

  const fetchStockStatus = async () => {
    try {
      const response = await axios.get('/api/reports/stock-status');
      setStockStatus(response.data);
    } catch (error) {
      console.error('Error fetching stock status report:', error);
    }
  };

  const calculateDailyTotal = () => {
    return dailyStockOut.reduce((total, record) => total + parseFloat(record.StockOutTotalPrice), 0).toFixed(2);
  };

  const printReport = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-black">
      <Navigation username={username} onLogout={onLogout} />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-yellow-500 mb-2">Reports</h1>
          <p className="text-gray-300">Generate and view stock management reports</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-900 rounded-lg p-1 border border-gray-700">
            <button
              onClick={() => setActiveTab('daily')}
              className={`px-6 py-2 rounded-md font-medium transition duration-200 ${
                activeTab === 'daily'
                  ? 'bg-yellow-500 text-black'
                  : 'text-gray-300 hover:text-yellow-500'
              }`}
            >
              Daily Stock Out Report
            </button>
            <button
              onClick={() => setActiveTab('status')}
              className={`px-6 py-2 rounded-md font-medium transition duration-200 ${
                activeTab === 'status'
                  ? 'bg-yellow-500 text-black'
                  : 'text-gray-300 hover:text-yellow-500'
              }`}
            >
              Stock Status Report
            </button>
          </div>
        </div>

        {/* Daily Stock Out Report */}
        {activeTab === 'daily' && (
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-yellow-500 text-xl font-bold">Daily Stock Out Report</h2>
              <div className="flex items-center space-x-4">
                <div>
                  <label className="block text-yellow-500 text-sm font-medium mb-1">
                    Select Date:
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:border-yellow-500"
                  />
                </div>
                <button
                  onClick={printReport}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-200"
                >
                  Print Report
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left text-yellow-500 py-3">Part Name</th>
                    <th className="text-left text-yellow-500 py-3">Category</th>
                    <th className="text-left text-yellow-500 py-3">Quantity</th>
                    <th className="text-left text-yellow-500 py-3">Unit Price</th>
                    <th className="text-left text-yellow-500 py-3">Total Price</th>
                    <th className="text-left text-yellow-500 py-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {dailyStockOut.map((record) => (
                    <tr key={record.stock_out_id} className="border-b border-gray-800">
                      <td className="text-white py-3">{record.spare_part_name}</td>
                      <td className="text-gray-300 py-3">{record.Category}</td>
                      <td className="text-red-400 py-3">{record.StockOutQuantity}</td>
                      <td className="text-white py-3">${record.StockOutUnitPrice}</td>
                      <td className="text-white py-3">${record.StockOutTotalPrice}</td>
                      <td className="text-gray-300 py-3">
                        {new Date(record.StockOutDate).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-yellow-500">
                    <td colSpan="4" className="text-yellow-500 py-3 font-bold text-right">
                      Total Amount:
                    </td>
                    <td className="text-yellow-500 py-3 font-bold">${calculateDailyTotal()}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>

              {dailyStockOut.length === 0 && (
                <div className="text-center text-gray-400 py-8">
                  No stock out records found for {new Date(selectedDate).toLocaleDateString()}
                </div>
              )}
            </div>

            {/* Signature Space */}
            <div className="mt-8 pt-6 border-t border-gray-700">
              <div className="flex justify-between items-end">
                <div className="text-center">
                  <div className="text-gray-300 mb-2">Prepared By:</div>
                  <div className="text-yellow-500 font-medium">{username}</div>
                  <div className="text-gray-400 text-sm">{new Date().toLocaleDateString()}</div>
                </div>
                <div className="text-center">
                  <div className="text-gray-300 mb-2">Authorized By:</div>
                  <div className="border-b border-gray-600 w-48 mb-2"></div>
                  <div className="text-gray-400 text-sm">Admin Signature</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stock Status Report */}
        {activeTab === 'status' && (
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-yellow-500 text-xl font-bold">Stock Status Report</h2>
              <button
                onClick={printReport}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-200"
              >
                Print Report
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left text-yellow-500 py-3">Spare Part Name</th>
                    <th className="text-left text-yellow-500 py-3">Category</th>
                    <th className="text-left text-yellow-500 py-3">Stored Quantity</th>
                    <th className="text-left text-yellow-500 py-3">Total Stock Out</th>
                    <th className="text-left text-yellow-500 py-3">Remaining Quantity</th>
                    <th className="text-left text-yellow-500 py-3">Unit Price</th>
                    <th className="text-left text-yellow-500 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stockStatus.map((item, index) => (
                    <tr key={index} className="border-b border-gray-800">
                      <td className="text-white py-3">{item.spare_part_name}</td>
                      <td className="text-gray-300 py-3">{item.Category}</td>
                      <td className="text-white py-3">{item.stored_quantity}</td>
                      <td className="text-red-400 py-3">{item.total_stock_out}</td>
                      <td className={`py-3 ${item.remaining_quantity < 10 ? 'text-red-500' : 'text-green-400'}`}>
                        {item.remaining_quantity}
                      </td>
                      <td className="text-white py-3">${item.UnitPrice}</td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded text-xs ${
                          item.remaining_quantity < 5
                            ? 'bg-red-600 text-white'
                            : item.remaining_quantity < 10
                            ? 'bg-yellow-600 text-black'
                            : 'bg-green-600 text-white'
                        }`}>
                          {item.remaining_quantity < 5 ? 'Critical' :
                           item.remaining_quantity < 10 ? 'Low' : 'Good'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {stockStatus.length === 0 && (
                <div className="text-center text-gray-400 py-8">
                  No stock status data available
                </div>
              )}
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-800 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-400">
                  {stockStatus.filter(item => item.remaining_quantity >= 10).length}
                </div>
                <div className="text-gray-300">Items in Good Stock</div>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-yellow-400">
                  {stockStatus.filter(item => item.remaining_quantity >= 5 && item.remaining_quantity < 10).length}
                </div>
                <div className="text-gray-300">Items with Low Stock</div>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-red-400">
                  {stockStatus.filter(item => item.remaining_quantity < 5).length}
                </div>
                <div className="text-gray-300">Critical Stock Items</div>
              </div>
            </div>

            {/* Signature Space */}
            <div className="mt-8 pt-6 border-t border-gray-700">
              <div className="flex justify-between items-end">
                <div className="text-center">
                  <div className="text-gray-300 mb-2">Prepared By:</div>
                  <div className="text-yellow-500 font-medium">{username}</div>
                  <div className="text-gray-400 text-sm">{new Date().toLocaleDateString()}</div>
                </div>
                <div className="text-center">
                  <div className="text-gray-300 mb-2">Authorized By:</div>
                  <div className="border-b border-gray-600 w-48 mb-2"></div>
                  <div className="text-gray-400 text-sm">Admin Signature</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Reports;
