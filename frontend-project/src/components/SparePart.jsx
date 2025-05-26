import { useState, useEffect } from 'react';
import axios from 'axios';
import Navigation from './Navigation';

function SparePart({ username, onLogout }) {
  const [spareParts, setSpareParts] = useState([]);
  const [formData, setFormData] = useState({
    Name: '',
    Category: '',
    Quantity: '',
    UnitPrice: ''
  });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  useEffect(() => {
    fetchSpareParts();
  }, []);

  const fetchSpareParts = async () => {
    try {
      const response = await axios.get('/api/spare-parts');
      setSpareParts(response.data);
    } catch (error) {
      console.error('Error fetching spare parts:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Validate Name field to only allow letters
    if (name === 'Name') {
      // Only allow letters (a-z, A-Z) and spaces
      const lettersOnlyRegex = /^[a-zA-Z\s]*$/;
      if (!lettersOnlyRegex.test(value)) {
        return; // Don't update state if invalid characters are entered
      }
    }

    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/spare-parts', formData);
      setMessage('Spare part added successfully');
      setMessageType('success');
      setFormData({ Name: '', Category: '', Quantity: '', UnitPrice: '' });
      fetchSpareParts();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error adding spare part');
      setMessageType('error');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const calculateTotalPrice = () => {
    const quantity = parseFloat(formData.Quantity) || 0;
    const unitPrice = parseFloat(formData.UnitPrice) || 0;
    return (quantity * unitPrice).toFixed(2);
  };

  return (
    <div className="min-h-screen bg-black">
      <Navigation username={username} onLogout={onLogout} />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-yellow-500 mb-2">Spare Parts Management</h1>
          <p className="text-gray-300">Add and manage automotive spare parts inventory</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Add Spare Part Form */}
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
            <h2 className="text-yellow-500 text-xl font-bold mb-6">Add New Spare Part</h2>

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
                  Part Name
                </label>
                <input
                  type="text"
                  name="Name"
                  value={formData.Name}
                  onChange={handleChange}
                  required
                  pattern="[a-zA-Z\s]+"
                  title="Only letters and spaces are allowed"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:border-yellow-500"
                  placeholder="Enter part name (letters only)"
                />
              </div>

              <div>
                <label className="block text-yellow-500 text-sm font-medium mb-2">
                  Category
                </label>
                <select
                  name="Category"
                  value={formData.Category}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:border-yellow-500"
                >
                  <option value="">Select category</option>
                  <option value="Engine">Engine</option>
                  <option value="Brakes">Brakes</option>
                  <option value="Electrical">Electrical</option>
                  <option value="Wheels">Wheels</option>
                  <option value="Transmission">Transmission</option>
                  <option value="Suspension">Suspension</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-yellow-500 text-sm font-medium mb-2">
                  Quantity
                </label>
                <input
                  type="number"
                  name="Quantity"
                  value={formData.Quantity}
                  onChange={handleChange}
                  required
                  min="0"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:border-yellow-500"
                  placeholder="Enter quantity"
                />
              </div>

              <div>
                <label className="block text-yellow-500 text-sm font-medium mb-2">
                  Unit Price
                </label>
                <input
                  type="number"
                  name="UnitPrice"
                  value={formData.UnitPrice}
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
                  value={`${calculateTotalPrice()} FRW`}
                  readOnly
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-300"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-yellow-500 text-black py-2 px-4 rounded-md hover:bg-yellow-600 font-medium transition duration-200"
              >
                Add Spare Part
              </button>
            </form>
          </div>

          {/* Spare Parts List */}
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
            <h2 className="text-yellow-500 text-xl font-bold mb-6">Current Inventory</h2>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left text-yellow-500 py-2">Name</th>
                    <th className="text-left text-yellow-500 py-2">Category</th>
                    <th className="text-left text-yellow-500 py-2">Qty</th>
                    <th className="text-left text-yellow-500 py-2">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {spareParts.map((part) => (
                    <tr key={part.spare_part_id} className="border-b border-gray-800">
                      <td className="text-white py-2">{part.Name}</td>
                      <td className="text-gray-300 py-2">{part.Category}</td>
                      <td className={`py-2 ${part.Quantity < 10 ? 'text-red-500' : 'text-white'}`}>
                        {part.Quantity}
                      </td>
                      <td className="text-white py-2">{part.UnitPrice} FRW</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {spareParts.length === 0 && (
                <div className="text-center text-gray-400 py-8">
                  No spare parts found
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SparePart;
