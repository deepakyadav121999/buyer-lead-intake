'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Edit, History, Save, X, ArrowLeft, User, Phone, Mail, MapPin, Home, Calendar, DollarSign, Clock, Tag, FileText, Activity } from 'lucide-react';
import { BuyerForm } from './BuyerForm';

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
  source: string;
  status: string;
  notes: string | null;
  tags: string[] | null;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

interface HistoryEntry {
  id: string;
  buyerId: string;
  changedBy: string;
  changedAt: string;
  diff: Record<string, { old: any; new: any }>;
}

interface BuyerDetailProps {
  buyer: Buyer;
  history: HistoryEntry[];
}

export function BuyerDetail({ buyer, history }: BuyerDetailProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);

  const formatBudget = (min: number | null, max: number | null) => {
    if (!min && !max) return 'Not specified';
    if (!min) return `Up to ₹${max?.toLocaleString()}`;
    if (!max) return `₹${min.toLocaleString()}+`;
    return `₹${min.toLocaleString()} - ₹${max.toLocaleString()}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New': return 'bg-blue-100 text-blue-800';
      case 'Qualified': return 'bg-green-100 text-green-800';
      case 'Contacted': return 'bg-yellow-100 text-yellow-800';
      case 'Visited': return 'bg-purple-100 text-purple-800';
      case 'Negotiation': return 'bg-orange-100 text-orange-800';
      case 'Converted': return 'bg-emerald-100 text-emerald-800';
      case 'Dropped': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isEditing) {
    return (
      <BuyerForm 
        initialData={buyer} 
        isEdit={true} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto p-4 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-indigo-600 transition-colors duration-200 mb-6 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
            <span className="font-medium">Back to Leads</span>
          </button>
          
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center space-x-4 mb-4 lg:mb-0">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center text-white font-bold text-2xl">
                {buyer.fullName.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {buyer.fullName}
                </h1>
                <p className="text-lg text-gray-600">Lead Details</p>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <span className={`px-4 py-2 text-sm font-semibold rounded-xl ${getStatusColor(buyer.status)}`}>
                {buyer.status}
              </span>
              <button
                onClick={() => setIsEditing(true)}
                className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2"
              >
                <Edit className="w-4 h-4" />
                <span>Edit Lead</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Personal Information */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Personal Information</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-600">
                    <User className="w-4 h-4" />
                    <span>Full Name</span>
                  </label>
                  <p className="text-lg font-medium text-gray-900">{buyer.fullName}</p>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>Phone Number</span>
                  </label>
                  <p className="text-lg font-medium text-gray-900">{buyer.phone}</p>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span>Email Address</span>
                  </label>
                  <p className="text-lg font-medium text-gray-900">{buyer.email || 'Not provided'}</p>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>City</span>
                  </label>
                  <p className="text-lg font-medium text-gray-900">{buyer.city}</p>
                </div>
              </div>
            </div>

            {/* Property Information */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                  <Home className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Property Information</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-600">
                    <Home className="w-4 h-4" />
                    <span>Property Type</span>
                  </label>
                  <p className="text-lg font-medium text-gray-900">
                    {buyer.propertyType}
                    {buyer.bhk && (
                      <span className="ml-2 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                        {buyer.bhk} BHK
                      </span>
                    )}
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>Purpose</span>
                  </label>
                  <p className="text-lg font-medium text-gray-900">{buyer.purpose}</p>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>Timeline</span>
                  </label>
                  <p className="text-lg font-medium text-gray-900">{buyer.timeline}</p>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-600">
                    <Tag className="w-4 h-4" />
                    <span>Source</span>
                  </label>
                  <p className="text-lg font-medium text-gray-900">{buyer.source}</p>
                </div>
              </div>
            </div>

            {/* Budget Information */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Budget Information</h2>
              </div>
              
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-900 mb-2">
                  {formatBudget(buyer.budgetMin, buyer.budgetMax)}
                </p>
                <p className="text-gray-600">Budget Range</p>
              </div>
            </div>

            {/* Additional Information */}
            {(buyer.notes || buyer.tags?.length) && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Additional Information</h2>
                </div>
                
                <div className="space-y-6">
                  {buyer.tags && buyer.tags.length > 0 && (
                    <div className="space-y-3">
                      <label className="flex items-center space-x-2 text-sm font-semibold text-gray-600">
                        <Tag className="w-4 h-4" />
                        <span>Tags</span>
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {buyer.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800 rounded-full text-sm font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {buyer.notes && (
                    <div className="space-y-3">
                      <label className="flex items-center space-x-2 text-sm font-semibold text-gray-600">
                        <FileText className="w-4 h-4" />
                        <span>Notes</span>
                      </label>
                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-gray-900 whitespace-pre-wrap">{buyer.notes}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Timeline */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Activity Timeline</h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-3 h-3 bg-green-400 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-gray-900">Lead Created</p>
                    <p className="text-sm text-gray-500">
                      {new Date(buyer.createdAt).toLocaleDateString()} at {new Date(buyer.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-3 h-3 bg-blue-400 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-gray-900">Last Updated</p>
                    <p className="text-sm text-gray-500">
                      {new Date(buyer.updatedAt).toLocaleDateString()} at {new Date(buyer.updatedAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
              
              <div className="space-y-3">
                <button
                  onClick={() => setIsEditing(true)}
                  className="w-full px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:from-indigo-600 hover:to-purple-600 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit Lead</span>
                </button>
                
                <button
                  onClick={() => router.back()}
                  className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Leads</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}