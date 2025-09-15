'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Filter, Download, Upload, Users, Plus, BarChart3 } from 'lucide-react';
import Link from 'next/link';

interface Buyer {
  id: string;
  fullName: string;
  email: string | null;
  phone: string;
  city: string;
  propertyType: string;
  bhk: string | null;
  purpose: string;
  budgetMin: number | null;
  budgetMax: number | null;
  timeline: string;
  status: string;
  updatedAt: string;
}

interface BuyersListProps {
  searchParams: {
    page?: string;
    search?: string;
    city?: string;
    propertyType?: string;
    status?: string;
    timeline?: string;
    sortBy?: string;
    sortOrder?: string;
  };
}

export function BuyersList({ searchParams }: BuyersListProps) {
  const router = useRouter();
  const urlSearchParams = useSearchParams();
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState(searchParams.search || '');
  const [filters, setFilters] = useState({
    city: searchParams.city || '',
    propertyType: searchParams.propertyType || '',
    status: searchParams.status || '',
    timeline: searchParams.timeline || '',
  });

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      updateURL();
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetchBuyers();
  }, [searchParams]);

  const updateURL = () => {
    const params = new URLSearchParams();
    
    if (search) params.set('search', search);
    if (filters.city) params.set('city', filters.city);
    if (filters.propertyType) params.set('propertyType', filters.propertyType);
    if (filters.status) params.set('status', filters.status);
    if (filters.timeline) params.set('timeline', filters.timeline);
    if (searchParams.sortBy) params.set('sortBy', searchParams.sortBy);
    if (searchParams.sortOrder) params.set('sortOrder', searchParams.sortOrder);
    
    router.push(`/buyers?${params.toString()}`);
  };

  const fetchBuyers = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('searchParams:', searchParams);
      const params = new URLSearchParams();
      
      // Only add valid parameters
      if (searchParams.search) params.set('search', searchParams.search);
      if (searchParams.city) params.set('city', searchParams.city);
      if (searchParams.propertyType) params.set('propertyType', searchParams.propertyType);
      if (searchParams.status) params.set('status', searchParams.status);
      if (searchParams.timeline) params.set('timeline', searchParams.timeline);
      if (searchParams.page) params.set('page', searchParams.page);
      if (searchParams.sortBy) params.set('sortBy', searchParams.sortBy);
      if (searchParams.sortOrder) params.set('sortOrder', searchParams.sortOrder);
      
      // Add cache-busting
      const timestamp = Date.now();
      params.set('_t', timestamp.toString());
      
      console.log('Clean URL params:', params.toString());
      const response = await fetch(`/api/buyers?${params.toString()}`);
      console.log('Main API response status:', response.status);
      console.log('Main API response headers:', response.headers);
      
      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error('JSON parse error:', jsonError);
        setError('Invalid response from server');
        setBuyers([]);
        setTotalPages(1);
        setCurrentPage(1);
        return;
      }
      
      console.log('API Response data:', data);
      console.log('Response OK:', response.ok);
      console.log('Data buyers:', data?.buyers);
      
      // Handle empty response or missing data
      if (!data || typeof data !== 'object') {
        console.error('Empty or invalid response data:', data);
        setError('No data received from server');
        setBuyers([]);
        setTotalPages(1);
        setCurrentPage(1);
        return;
      }
      
      if (response.ok) {
        // Always set buyers array, even if empty
        setBuyers(Array.isArray(data.buyers) ? data.buyers : []);
        setTotalPages(data.totalPages || 1);
        setCurrentPage(data.currentPage || 1);
        setError(null); // Clear any previous errors
      } else {
        console.error('API Error:', data);
        console.error('Response status:', response.status);
        console.error('Response statusText:', response.statusText);
        setError(data.error || 'Failed to fetch buyers');
        setBuyers([]);
        setTotalPages(1);
        setCurrentPage(1);
      }
    } catch (error) {
      console.error('Error fetching buyers:', error);
      setError('Network error. Please try again.');
      setBuyers([]);
      setTotalPages(1);
      setCurrentPage(1);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    const newParams = new URLSearchParams(urlSearchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.delete('page'); // Reset to first page
    router.push(`/buyers?${newParams.toString()}`);
  };

  const handleSort = (sortBy: string) => {
    const newParams = new URLSearchParams(urlSearchParams);
    const currentSortBy = searchParams.sortBy || 'updatedAt';
    const currentSortOrder = searchParams.sortOrder || 'desc';
    
    if (currentSortBy === sortBy) {
      newParams.set('sortOrder', currentSortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      newParams.set('sortBy', sortBy);
      newParams.set('sortOrder', 'desc');
    }
    
    router.push(`/buyers?${newParams.toString()}`);
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams(searchParams);
      const response = await fetch(`/api/buyers/export?${params.toString()}`);
      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'buyers.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  const formatBudget = (min: number | null, max: number | null) => {
    if (!min && !max) return '-';
    if (!min) return `Up to ₹${max?.toLocaleString()}`;
    if (!max) return `₹${min.toLocaleString()}+`;
    return `₹${min.toLocaleString()} - ₹${max.toLocaleString()}`;
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">{error}</div>
        <button
          onClick={fetchBuyers}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="space-y-6 p-4 lg:p-8">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Buyer Leads Dashboard
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Manage and track your property buyer leads with our advanced CRM system
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Leads</p>
                <p className="text-3xl font-bold text-indigo-600">{buyers.length}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">New Leads</p>
                <p className="text-3xl font-bold text-green-600">{buyers.filter(b => b.status === 'New').length}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <Plus className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Qualified</p>
                <p className="text-3xl font-bold text-blue-600">{buyers.filter(b => b.status === 'Qualified').length}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Converted</p>
                <p className="text-3xl font-bold text-purple-600">{buyers.filter(b => b.status === 'Converted').length}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Download className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search by name, phone, or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-12 pr-4 py-3 w-full border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/50 backdrop-blur-sm transition-all duration-200"
                />
              </div>
            </div>
            
            <select
              value={filters.city}
              onChange={(e) => handleFilterChange('city', e.target.value)}
              className="border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/50 backdrop-blur-sm transition-all duration-200"
            >
              <option value="">All Cities</option>
              <option value="Chandigarh">Chandigarh</option>
              <option value="Mohali">Mohali</option>
              <option value="Zirakpur">Zirakpur</option>
              <option value="Panchkula">Panchkula</option>
              <option value="Other">Other</option>
            </select>
            
            <select
              value={filters.propertyType}
              onChange={(e) => handleFilterChange('propertyType', e.target.value)}
              className="border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/50 backdrop-blur-sm transition-all duration-200"
            >
              <option value="">All Types</option>
              <option value="Apartment">Apartment</option>
              <option value="Villa">Villa</option>
              <option value="Plot">Plot</option>
              <option value="Office">Office</option>
              <option value="Retail">Retail</option>
            </select>
            
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/50 backdrop-blur-sm transition-all duration-200"
            >
              <option value="">All Status</option>
              <option value="New">New</option>
              <option value="Qualified">Qualified</option>
              <option value="Contacted">Contacted</option>
              <option value="Visited">Visited</option>
              <option value="Negotiation">Negotiation</option>
              <option value="Converted">Converted</option>
              <option value="Dropped">Dropped</option>
            </select>
          </div>
          
          <div className="mt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex flex-wrap gap-2">
              <select
                value={filters.timeline}
                onChange={(e) => handleFilterChange('timeline', e.target.value)}
                className="border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/50 backdrop-blur-sm transition-all duration-200"
              >
                <option value="">All Timelines</option>
                <option value="0-3m">0-3 months</option>
                <option value="3-6m">3-6 months</option>
                <option value=">6m">6 months</option>
                <option value="Exploring">Exploring</option>
              </select>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleExport}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:from-green-600 hover:to-emerald-600"
              >
                <Download className="h-5 w-5 mr-2" />
                Export CSV
              </button>
              
              <Link
                href="/buyers/import"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:from-blue-600 hover:to-cyan-600"
              >
                <Upload className="h-5 w-5 mr-2" />
                Import CSV
              </Link>
            </div>
          </div>
        </div>

        {/* Leads Table */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
                    onClick={() => handleSort('fullName')}
                  >
                    <div className="flex items-center space-x-2">
                      <span>Name</span>
                      <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Contact
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Location
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Property
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Budget
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Timeline
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
                    onClick={() => handleSort('updatedAt')}
                  >
                    <div className="flex items-center space-x-2">
                      <span>Updated</span>
                      <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
                    </div>
                  </th>
                  <th scope="col" className="relative px-6 py-4">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {(buyers || []).map((buyer, index) => (
                  <tr key={buyer.id} className="hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-200 group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {buyer.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{buyer.fullName}</div>
                          {buyer.email && (
                            <div className="text-sm text-gray-500">{buyer.email}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{buyer.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span className="text-sm font-medium text-gray-900">{buyer.city}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {buyer.propertyType}
                        {buyer.bhk && (
                          <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {buyer.bhk} BHK
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        {formatBudget(buyer.budgetMin, buyer.budgetMax)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">
                        {buyer.timeline}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                        buyer.status === 'New' ? 'bg-blue-100 text-blue-800' :
                        buyer.status === 'Qualified' ? 'bg-green-100 text-green-800' :
                        buyer.status === 'Converted' ? 'bg-purple-100 text-purple-800' :
                        buyer.status === 'Dropped' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {buyer.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(buyer.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={`/buyers/${buyer.id}`}
                        className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-2 rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all duration-200 shadow-md hover:shadow-lg"
                      >
                        View/Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden">
            {(buyers || []).map((buyer) => (
              <div key={buyer.id} className="p-6 border-b border-gray-100 last:border-b-0 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {buyer.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{buyer.fullName}</h3>
                      {buyer.email && (
                        <p className="text-sm text-gray-500">{buyer.email}</p>
                      )}
                    </div>
                  </div>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    buyer.status === 'New' ? 'bg-blue-100 text-blue-800' :
                    buyer.status === 'Qualified' ? 'bg-green-100 text-green-800' :
                    buyer.status === 'Converted' ? 'bg-purple-100 text-purple-800' :
                    buyer.status === 'Dropped' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {buyer.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Phone</p>
                    <p className="text-sm font-medium text-gray-900">{buyer.phone}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">City</p>
                    <p className="text-sm font-medium text-gray-900">{buyer.city}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Property</p>
                    <p className="text-sm font-medium text-gray-900">
                      {buyer.propertyType}
                      {buyer.bhk && ` (${buyer.bhk} BHK)`}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Timeline</p>
                    <p className="text-sm font-medium text-gray-900">{buyer.timeline}</p>
                  </div>
                </div>
                
                <div className="mb-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Budget</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {formatBudget(buyer.budgetMin, buyer.budgetMax)}
                  </p>
                </div>
                
                <div className="flex justify-between items-center">
                  <p className="text-xs text-gray-500">
                    Updated: {new Date(buyer.updatedAt).toLocaleDateString()}
                  </p>
                  <Link
                    href={`/buyers/${buyer.id}`}
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-2 rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all duration-200 shadow-md hover:shadow-lg text-sm font-medium"
                  >
                    View/Edit
                  </Link>
                </div>
              </div>
            ))}
          </div>
          
          {buyers.length === 0 && (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No leads found</h3>
              <p className="text-gray-500 mb-6">Try adjusting your search criteria or create a new lead.</p>
              <Link
                href="/buyers/new"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:from-indigo-700 hover:to-purple-700"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create New Lead
              </Link>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => {
                    const newParams = new URLSearchParams(urlSearchParams);
                    newParams.set('page', (currentPage - 1).toString());
                    router.push(`/buyers?${newParams.toString()}`);
                  }}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-6 py-3 border border-gray-200 text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Previous
                </button>
                <button
                  onClick={() => {
                    const newParams = new URLSearchParams(urlSearchParams);
                    newParams.set('page', (currentPage + 1).toString());
                    router.push(`/buyers?${newParams.toString()}`);
                  }}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-6 py-3 border border-gray-200 text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing page <span className="font-semibold text-indigo-600">{currentPage}</span> of{' '}
                    <span className="font-semibold text-indigo-600">{totalPages}</span>
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-xl shadow-lg -space-x-px">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => {
                          const newParams = new URLSearchParams(urlSearchParams);
                          newParams.set('page', page.toString());
                          router.push(`/buyers?${newParams.toString()}`);
                        }}
                        className={`relative inline-flex items-center px-4 py-2 text-sm font-medium transition-all duration-200 ${
                          page === currentPage
                            ? 'z-10 bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
                            : 'bg-white text-gray-700 hover:bg-indigo-50 hover:text-indigo-600'
                        } ${page === 1 ? 'rounded-l-xl' : ''} ${page === totalPages ? 'rounded-r-xl' : ''}`}
                      >
                        {page}
                      </button>
                    ))}
                  </nav>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

