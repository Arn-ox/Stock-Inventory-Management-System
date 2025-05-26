import { useState, useEffect } from 'react';
import axios from 'axios';
import Navigation from './Navigation';

function StockIn({ username, onLogout }) {
  const [stockInRecords, setStockInRecords] = useState([]);
  const [spareParts, setSpareParts] = useState([]);
  const [formData, setFormData] = useState({
    spare_part_id: '',
    StockInQuantity: '',
    StockInDate: new Date().toISOString().split('T')[0]
  });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  useEffect(() => {
    fetchStockInRecords();
    fetchSpareParts();
  }, []);

  const fetchStockInRecords = async () => {
    try {
      const response = await axios.get('/api/stock-in');
      setStockInRecords(response.data);
    } catch (error) {
      console.error('Error fetching stock in records:', error);
    }
  };

  const fetchSpareParts = async () => {
    try {
      const response = await axios.get('/api/spare-parts');
      setSpareParts(response.data);
    } catch (error) {
      console.error('Error fetching spare parts:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/stock-in', formData);
      setMessage('Stock in recorded successfully');
      setMessageType('success');
      setFormData({
        spare_part_id: '',
        StockInQuantity: '',
        StockInDate: new Date().toISOString().split('T')[0]
      });
      fetchStockInRecords();
      fetchSpareParts(); // Refresh to show updated quantities
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error recording stock in');
      setMessageType('error');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const getSelectedPartInfo = () => {
    const selectedPart = spareParts.find(part => part.spare_part_id == formData.spare_part_id);
    return selectedPart || null;
  };

  return (
    <div className="min-h-screen bg-black">
      <Navigation username={username} onLogout={onLogout} />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-yellow-500 mb-2">Stock In Management</h1>
          <p className="text-gray-300">Record incoming spare parts inventory</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Stock In Form */}
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
            <h2 className="text-yellow-500 text-xl font-bold mb-6">Record Stock In</h2>

            {message && (
              <div className={`mb-4 p-3 rounded-md ${
                messageType === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
              }`}>
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-yellow-500 text-sm font-medium mb-2">
                  Spare Part
                </label>
                <select
                  name="spare_part_id"
                  value={formData.spare_part_id}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:border-yellow-500"
                >
                  <option value="">Select spare part</option>
                  {spareParts.map((part) => (
                    <option key={part.spare_part_id} value={part.spare_part_id}>
                      {part.Name} - {part.Category} (Current: {part.Quantity})
                    </option>
                  ))}
                </select>
              </div>

              {getSelectedPartInfo() && (
                <div className="bg-gray-800 p-3 rounded-md">
                  <h4 className="text-yellow-500 font-medium mb-2">Selected Part Info:</h4>
                  <div className="text-gray-300 text-sm space-y-1">
                    <p>Name: {getSelectedPartInfo().Name}</p>
                    <p>Category: {getSelectedPartInfo().Category}</p>
                    <p>Current Quantity: {getSelectedPartInfo().Quantity}</p>
                    <p>Unit Price: ${getSelectedPartInfo().UnitPrice}</p>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-yellow-500 text-sm font-medium mb-2">
                  Stock In Quantity
                </label>
                <input
                  type="number"
                  name="StockInQuantity"
                  value={formData.StockInQuantity}
                  onChange={handleChange}
                  required
                  min="1"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:border-yellow-500"
                  placeholder="Enter quantity to add"
                />
              </div>

              <div>
                <label className="block text-yellow-500 text-sm font-medium mb-2">
                  Stock In Date
                </label>
                <input
                  type="date"
                  name="StockInDate"
                  value={formData.StockInDate}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:border-yellow-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 font-medium transition duration-200"
              >
                Record Stock In
              </button>
            </form>
          </div>

          {/* Stock In Records */}
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
            <h2 className="text-yellow-500 text-xl font-bold mb-6">Recent Stock In Records</h2>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left text-yellow-500 py-2">Part Name</th>
                    <th className="text-left text-yellow-500 py-2">Quantity</th>
                    <th className="text-left text-yellow-500 py-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {stockInRecords.slice(0, 10).map((record) => (
                    <tr key={record.stock_in_id} className="border-b border-gray-800">
                      <td className="text-white py-2">{record.spare_part_name}</td>
                      <td className="text-green-400 py-2">+{record.StockInQuantity}</td>
                      <td className="text-gray-300 py-2">
                        {new Date(record.StockInDate).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {stockInRecords.length === 0 && (
                <div className="text-center text-gray-400 py-8">
                  No stock in records found
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StockIn;
