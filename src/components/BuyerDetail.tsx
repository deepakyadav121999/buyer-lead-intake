'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Edit, History, Save, X } from 'lucide-react';
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
  changedAt: string;
  diff: Record<string, { old: any; new: any }>;
  changedBy: {
    name: string | null;
    email: string;
  };
}

interface BuyerDetailProps {
  buyer: Buyer;
  history: HistoryEntry[];
}

export function BuyerDetail({ buyer, history }: BuyerDetailProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [concurrencyError, setConcurrencyError] = useState('');

  const handleSave = async (data: any) => {
    setIsSaving(true);
    setConcurrencyError('');
    
    try {
      const response = await fetch(`/api/buyers/${buyer.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          updatedAt: buyer.updatedAt, // Include for concurrency check
        }),
      });

      if (response.ok) {
        setIsEditing(false);
        router.refresh(); // Refresh the page to get updated data
      } else {
        const error = await response.json();
        if (error.message === 'Concurrency conflict') {
          setConcurrencyError('Record has been changed by another user. Please refresh and try again.');
        } else {
          alert(error.message || 'An error occurred');
        }
      }
    } catch (error) {
      console.error('Error saving buyer:', error);
      alert('An error occurred');
    } finally {
      setIsSaving(false);
    }
  };

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
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Edit Lead</h1>
          <button
            onClick={() => setIsEditing(false)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </button>
        </div>

        {concurrencyError && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Concurrency Conflict
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  {concurrencyError}
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => router.refresh()}
                    className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200"
                  >
                    Refresh Page
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <BuyerForm
          initialData={{
            id: buyer.id,
            fullName: buyer.fullName,
            email: buyer.email || '',
            phone: buyer.phone,
            city: buyer.city as any,
            propertyType: buyer.propertyType as any,
            bhk: buyer.bhk as any,
            purpose: buyer.purpose as any,
            budgetMin: buyer.budgetMin || undefined,
            budgetMax: buyer.budgetMax || undefined,
            timeline: buyer.timeline as any,
            source: buyer.source as any,
            notes: buyer.notes || '',
            tags: buyer.tags || [],
          }}
          isEdit={true}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{buyer.fullName}</h1>
          <p className="mt-1 text-sm text-gray-600">
            Created {new Date(buyer.createdAt).toLocaleDateString()} • 
            Last updated {new Date(buyer.updatedAt).toLocaleDateString()}
          </p>
        </div>
        <button
          onClick={() => setIsEditing(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit Lead
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h2>
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Full Name</dt>
                <dd className="mt-1 text-sm text-gray-900">{buyer.fullName}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Phone</dt>
                <dd className="mt-1 text-sm text-gray-900">{buyer.phone}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900">{buyer.email || 'Not provided'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">City</dt>
                <dd className="mt-1 text-sm text-gray-900">{buyer.city}</dd>
              </div>
            </dl>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Property Requirements</h2>
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Property Type</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {buyer.propertyType}
                  {buyer.bhk && ` (${buyer.bhk} BHK)`}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Purpose</dt>
                <dd className="mt-1 text-sm text-gray-900">{buyer.purpose}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Budget</dt>
                <dd className="mt-1 text-sm text-gray-900">{formatBudget(buyer.budgetMin, buyer.budgetMax)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Timeline</dt>
                <dd className="mt-1 text-sm text-gray-900">{buyer.timeline}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Source</dt>
                <dd className="mt-1 text-sm text-gray-900">{buyer.source}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(buyer.status)}`}>
                    {buyer.status}
                  </span>
                </dd>
              </div>
            </dl>
          </div>

          {buyer.notes && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Notes</h2>
              <p className="text-sm text-gray-900 whitespace-pre-wrap">{buyer.notes}</p>
            </div>
          )}

          {buyer.tags && buyer.tags.length > 0 && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Tags</h2>
              <div className="flex flex-wrap gap-2">
                {buyer.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* History Sidebar */}
        <div className="space-y-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <History className="h-5 w-5 mr-2" />
              Recent Changes
            </h2>
            <div className="space-y-4">
              {history.length === 0 ? (
                <p className="text-sm text-gray-500">No changes recorded</p>
              ) : (
                history.map((entry) => (
                  <div key={entry.id} className="border-l-4 border-gray-200 pl-4">
                    <div className="text-sm text-gray-900">
                      {Object.entries(entry.diff).map(([field, change]) => (
                        <div key={field} className="mb-1">
                          <span className="font-medium">{field}:</span>{' '}
                          <span className="text-gray-600">
                            {change.old ? `"${change.old}"` : 'null'} → {change.new ? `"${change.new}"` : 'null'}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(entry.changedAt).toLocaleString()} by {entry.changedBy.name || entry.changedBy.email}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

