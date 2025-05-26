import { useState, useEffect } from 'react';
import axios from 'axios';
import Navigation from './Navigation';

function StockOut({ username, onLogout }) {
  const [stockOutRecords, setStockOutRecords] = useState([]);
  const [spareParts, setSpareParts] = useState([]);
  const [formData, setFormData] = useState({
    spare_part_id: '',
    StockOutQuantity: '',
    StockOutUnitPrice: '',
    StockOutDate: new Date().toISOString().split('T')[0]
  });
  const [editingRecord, setEditingRecord] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  useEffect(() => {
    fetchStockOutRecords();
    fetchSpareParts();
  }, []);

  const fetchStockOutRecords = async () => {
    try {
      const response = await axios.get('/api/stock-out');
      setStockOutRecords(response.data);
    } catch (error) {
      console.error('Error fetching stock out records:', error);
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
      if (editingRecord) {
        await axios.put(`/api/stock-out/${editingRecord.stock_out_id}`, formData);
        setMessage('Stock out updated successfully');
        setEditingRecord(null);
      } else {
        await axios.post('/api/stock-out', formData);
        setMessage('Stock out recorded successfully');
      }

      setMessageType('success');
      setFormData({
        spare_part_id: '',
        StockOutQuantity: '',
        StockOutUnitPrice: '',
        StockOutDate: new Date().toISOString().split('T')[0]
      });
      fetchStockOutRecords();
      fetchSpareParts();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error processing stock out');
      setMessageType('error');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    setFormData({
      spare_part_id: record.spare_part_id,
      StockOutQuantity: record.StockOutQuantity,
      StockOutUnitPrice: record.StockOutUnitPrice,
      StockOutDate: record.StockOutDate.split('T')[0]
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      try {
        await axios.delete(`/api/stock-out/${id}`);
        setMessage('Stock out record deleted successfully');
        setMessageType('success');
        fetchStockOutRecords();
        setTimeout(() => setMessage(''), 3000);
      } catch (error) {
        setMessage('Error deleting record');
        setMessageType('error');
        setTimeout(() => setMessage(''), 3000);
      }
    }
  };

  const cancelEdit = () => {
    setEditingRecord(null);
    setFormData({
      spare_part_id: '',
      StockOutQuantity: '',
      StockOutUnitPrice: '',
      StockOutDate: new Date().toISOString().split('T')[0]
    });
  };

  const getSelectedPartInfo = () => {
    const selectedPart = spareParts.find(part => part.spare_part_id == formData.spare_part_id);
    return selectedPart || null;
  };

  const calculateTotalPrice = () => {
    const quantity = parseFloat(formData.StockOutQuantity) || 0;
    const unitPrice = parseFloat(formData.StockOutUnitPrice) || 0;
    return (quantity * unitPrice).toFixed(2);
  };

  return (
    <div className="min-h-screen bg-black">
      <Navigation username={username} onLogout={onLogout} />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-yellow-500 mb-2">Stock Out Management</h1>
          <p className="text-gray-300">Record and manage outgoing spare parts inventory</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Stock Out Form */}
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
            <h2 className="text-yellow-500 text-xl font-bold mb-6">
              {editingRecord ? 'Edit Stock Out Record' : 'Record Stock Out'}
            </h2>

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
                      {part.Name} - {part.Category} (Available: {part.Quantity})
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
                    <p>Available Quantity: {getSelectedPartInfo().Quantity}</p>
                    <p>Unit Price: ${getSelectedPartInfo().UnitPrice}</p>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-yellow-500 text-sm font-medium mb-2">
                  Stock Out Quantity
                </label>
                <input
                  type="number"
                  name="StockOutQuantity"
                  value={formData.StockOutQuantity}
                  onChange={handleChange}
                  required
                  min="1"
                  max={getSelectedPartInfo()?.Quantity || 999}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:border-yellow-500"
                  placeholder="Enter quantity to remove"
                />
              </div>

              <div>
                <label className="block text-yellow-500 text-sm font-medium mb-2">
                  Unit Price
                </label>
                <input
                  type="number"
                  name="StockOutUnitPrice"
                  value={formData.StockOutUnitPrice}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:border-yellow-500"
                  placeholder="Enter unit price (FRW)"
                />
              </div>

              <div>
                <label className="block text-yellow-500 text-sm font-medium mb-2">
                  Total Price
                </label>
                <input
                  type="text"
                  value={`$${calculateTotalPrice()} FRW`}
                  readOnly
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-300"
                />
              </div>

              <div>
                <label className="block text-yellow-500 text-sm font-medium mb-2">
                  Stock Out Date
                </label>
                <input
                  type="date"
                  name="StockOutDate"
                  value={formData.StockOutDate}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:border-yellow-500"
                />
              </div>

              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 font-medium transition duration-200"
                >
                  {editingRecord ? 'Update Stock Out' : 'Record Stock Out'}
                </button>

                {editingRecord && (
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 font-medium transition duration-200"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Stock Out Records */}
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
            <h2 className="text-yellow-500 text-xl font-bold mb-6">Stock Out Records</h2>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left text-yellow-500 py-2">Part Name</th>
                    <th className="text-left text-yellow-500 py-2">Qty</th>
                    <th className="text-left text-yellow-500 py-2">Price</th>
                    <th className="text-left text-yellow-500 py-2">Total</th>
                    <th className="text-left text-yellow-500 py-2">Date</th>
                    <th className="text-left text-yellow-500 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {stockOutRecords.map((record) => (
                    <tr key={record.stock_out_id} className="border-b border-gray-800">
                      <td className="text-white py-2">{record.spare_part_name}</td>
                      <td className="text-red-400 py-2">-{record.StockOutQuantity}</td>
                      <td className="text-white py-2">{record.StockOutUnitPrice} FRW</td>
                      <td className="text-white py-2">{record.StockOutTotalPrice} FRW</td>
                      <td className="text-gray-300 py-2">
                        {new Date(record.StockOutDate).toLocaleDateString()}
                      </td>
                      <td className="py-2">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(record)}
                            className="bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700 transition duration-200"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(record.stock_out_id)}
                            className="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700 transition duration-200"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {stockOutRecords.length === 0 && (
                <div className="text-center text-gray-400 py-8">
                  No stock out records found
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StockOut;
