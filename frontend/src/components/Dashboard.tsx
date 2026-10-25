import React, { useEffect, useState } from 'react';
import {
  getVehicles,
  searchVehicles,
  purchaseVehicle,
  restockVehicle,
  deleteVehicle,
  createVehicle,
  updateVehicle
} from '../services/api';

interface DashboardProps {
  onLogout: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [searchMake, setSearchMake] = useState('');
  const [searchCategory, setSearchCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Admin modal or form state
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    make: '',
    model: '',
    category: '',
    price: '',
    quantity: ''
  });

  const role = localStorage.getItem('role');
  const username = localStorage.getItem('username');

  const fetchAllVehicles = async () => {
    try {
      const res = await getVehicles();
      setVehicles(res.data);
    } catch (err: any) {
      setError('Failed to fetch vehicles');
    }
  };

  useEffect(() => {
    fetchAllVehicles();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const params: any = {};
      if (searchMake) params.make = searchMake;
      if (searchCategory) params.category = searchCategory;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;

      const res = await searchVehicles(params);
      setVehicles(res.data);
    } catch (err: any) {
      setError('Search failed');
    }
  };

  const handleResetSearch = () => {
    setSearchMake('');
    setSearchCategory('');
    setMinPrice('');
    setMaxPrice('');
    fetchAllVehicles();
  };

  const handlePurchase = async (id: string) => {
    try {
      await purchaseVehicle(id);
      setSuccessMessage('Vehicle purchased successfully!');
      fetchAllVehicles();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Purchase failed');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this vehicle?')) return;
    try {
      await deleteVehicle(id);
      setSuccessMessage('Vehicle deleted successfully.');
      fetchAllVehicles();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Delete failed (Admin access required)');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleRestock = async (id: string) => {
    const qtyStr = prompt('Enter quantity to add:');
    if (!qtyStr) return;
    const quantity = parseInt(qtyStr, 10);
    if (isNaN(quantity) || quantity <= 0) {
      alert('Please enter a valid quantity');
      return;
    }
    try {
      await restockVehicle(id, quantity);
      setSuccessMessage('Vehicle restocked successfully.');
      fetchAllVehicles();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Restock failed');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleSaveVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        quantity: Number(formData.quantity)
      };

      if (isEditing) {
        await updateVehicle(formData.id, payload);
        setSuccessMessage('Vehicle updated successfully!');
      } else {
        await createVehicle(payload);
        setSuccessMessage('Vehicle added successfully!');
      }

      setShowModal(false);
      setFormData({ id: '', make: '', model: '', category: '', price: '', quantity: '' });
      fetchAllVehicles();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Operation failed');
    }
  };

  const openAddModal = () => {
    setIsEditing(false);
    setFormData({ id: `v-${Date.now()}`, make: '', model: '', category: '', price: '', quantity: '' });
    setShowModal(true);
  };

  const openEditModal = (vehicle: any) => {
    setIsEditing(true);
    setFormData({
      id: vehicle.id,
      make: vehicle.make,
      model: vehicle.model,
      category: vehicle.category,
      price: vehicle.price.toString(),
      quantity: vehicle.quantity.toString()
    });
    setShowModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Navbar */}
      <nav className="bg-blue-600 shadow-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <h1 className="text-xl font-bold text-white">Car Dealership Inventory System</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-white">
              Welcome, <span className="font-semibold">{username}</span> ({role?.toUpperCase()})
            </span>
            <button
              onClick={onLogout}
              className="rounded bg-white px-3 py-1 text-sm font-semibold text-blue-600 hover:bg-gray-100"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-4 pt-6">
        {error && <div className="mb-4 rounded bg-red-100 p-3 text-sm text-red-700">{error}</div>}
        {successMessage && <div className="mb-4 rounded bg-green-100 p-3 text-sm text-green-700">{successMessage}</div>}

        {/* Search & Filter Section */}
        <div className="mb-6 rounded-lg bg-white p-4 shadow">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">Search & Filter Inventory</h2>
          <form onSubmit={handleSearch} className="grid grid-cols-1 gap-4 md:grid-cols-5">
            <input
              type="text"
              placeholder="Make (e.g. Toyota)"
              value={searchMake}
              onChange={(e) => setSearchMake(e.target.value)}
              className="rounded border border-gray-300 p-2 text-sm focus:outline-none focus:border-blue-500"
            />
            <input
              type="text"
              placeholder="Category (e.g. Sedan)"
              value={searchCategory}
              onChange={(e) => setSearchCategory(e.target.value)}
              className="rounded border border-gray-300 p-2 text-sm focus:outline-none focus:border-blue-500"
            />
            <input
              type="number"
              placeholder="Min Price"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="rounded border border-gray-300 p-2 text-sm focus:outline-none focus:border-blue-500"
            />
            <input
              type="number"
              placeholder="Max Price"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="rounded border border-gray-300 p-2 text-sm focus:outline-none focus:border-blue-500"
            />
            <div className="flex space-x-2">
              <button
                type="submit"
                className="flex-1 rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Search
              </button>
              <button
                type="button"
                onClick={handleResetSearch}
                className="rounded bg-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-400"
              >
                Reset
              </button>
            </div>
          </form>
        </div>

        {/* Header & Admin Add Button */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">Vehicle Inventory</h2>
          {role === 'admin' && (
            <button
              onClick={openAddModal}
              className="rounded bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
            >
              + Add New Vehicle (Admin)
            </button>
          )}
        </div>

        {/* Vehicle Cards Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {vehicles.map((vehicle) => (
            <div key={vehicle.id} className="rounded-lg bg-white p-6 shadow-md flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-bold text-gray-900">
                    {vehicle.make} {vehicle.model}
                  </h3>
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">
                    {vehicle.category}
                  </span>
                </div>
                <p className="mt-2 text-2xl font-extrabold text-blue-600">${vehicle.price.toLocaleString()}</p>
                <p className="mt-1 text-sm text-gray-600">
                  Stock Quantity:{' '}
                  <span className={`font-bold ${vehicle.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {vehicle.quantity} {vehicle.quantity === 0 && '(Out of Stock)'}
                  </span>
                </p>
              </div>

              <div className="mt-6 flex flex-col space-y-2">
                <button
                  onClick={() => handlePurchase(vehicle.id)}
                  disabled={vehicle.quantity <= 0}
                  className={`w-full rounded py-2 text-sm font-semibold text-white transition ${
                    vehicle.quantity > 0
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                >
                  {vehicle.quantity > 0 ? 'Purchase Vehicle' : 'Out of Stock'}
                </button>

                {role === 'admin' && (
                  <div className="flex space-x-2 pt-2 border-t border-gray-100">
                    <button
                      onClick={() => handleRestock(vehicle.id)}
                      className="flex-1 rounded bg-yellow-500 py-1 text-xs font-semibold text-white hover:bg-yellow-600"
                    >
                      Restock
                    </button>
                    <button
                      onClick={() => openEditModal(vehicle)}
                      className="flex-1 rounded bg-indigo-600 py-1 text-xs font-semibold text-white hover:bg-indigo-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(vehicle.id)}
                      className="flex-1 rounded bg-red-600 py-1 text-xs font-semibold text-white hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
          {vehicles.length === 0 && (
            <p className="col-span-3 text-center text-gray-500 py-8">No vehicles found in inventory.</p>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <h3 className="mb-4 text-lg font-bold text-gray-800">
              {isEditing ? 'Edit Vehicle' : 'Add New Vehicle'}
            </h3>
            <form onSubmit={handleSaveVehicle} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Make</label>
                <input
                  type="text"
                  value={formData.make}
                  onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                  required
                  className="mt-1 w-full rounded border border-gray-300 p-2 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Model</label>
                <input
                  type="text"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  required
                  className="mt-1 w-full rounded border border-gray-300 p-2 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                  className="mt-1 w-full rounded border border-gray-300 p-2 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Price ($)</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                  className="mt-1 w-full rounded border border-gray-300 p-2 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Quantity</label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  required
                  className="mt-1 w-full rounded border border-gray-300 p-2 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded bg-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};