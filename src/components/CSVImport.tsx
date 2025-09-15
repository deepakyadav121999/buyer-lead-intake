'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, Download, AlertCircle, CheckCircle } from 'lucide-react';

interface ImportError {
  row: number;
  field: string;
  message: string;
}

interface ImportResult {
  success: boolean;
  imported: number;
  errors: ImportError[];
  message: string;
}

export function CSVImport() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      setResult(null);
    } else {
      alert('Please select a valid CSV file');
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/buyers/import', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      setResult(data);

      if (data.success) {
        // Clear file after successful import
        setFile(null);
        const fileInput = document.getElementById('csv-file') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      }
    } catch (error) {
      console.error('Import error:', error);
      setResult({
        success: false,
        imported: 0,
        errors: [],
        message: 'An error occurred during import',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const downloadTemplate = () => {
    const headers = [
      'fullName',
      'email',
      'phone',
      'city',
      'propertyType',
      'bhk',
      'purpose',
      'budgetMin',
      'budgetMax',
      'timeline',
      'source',
      'notes',
      'tags',
      'status'
    ];

    const csvContent = headers.join(',') + '\n';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'buyer-leads-template.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Import Instructions
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc list-inside space-y-1">
                <li>Maximum 200 rows per import</li>
                <li>Required fields: fullName, phone, city, propertyType, purpose, timeline, source</li>
                <li>BHK is required for Apartment and Villa property types</li>
                <li>Valid cities: Chandigarh, Mohali, Zirakpur, Panchkula, Other</li>
                <li>Valid property types: Apartment, Villa, Plot, Office, Retail</li>
                <li>Valid BHK values: 1, 2, 3, 4, Studio</li>
                <li>Valid purposes: Buy, Rent</li>
                <li>Valid timelines: 0-3m, 3-6m, &gt;6m, Exploring</li>
                <li>Valid sources: Website, Referral, Walk-in, Call, Other</li>
                <li>Valid statuses: New, Qualified, Contacted, Visited, Negotiation, Converted, Dropped</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Form */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="csv-file" className="block text-sm font-medium text-gray-700">
              Select CSV File
            </label>
            <input
              id="csv-file"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
          </div>

          <div className="flex space-x-3">
            <button
              onClick={downloadTemplate}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Template
            </button>

            <button
              onClick={handleUpload}
              disabled={!file || isUploading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              <Upload className="h-4 w-4 mr-2" />
              {isUploading ? 'Importing...' : 'Import CSV'}
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className={`border rounded-md p-4 ${
          result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex">
            <div className="flex-shrink-0">
              {result.success ? (
                <CheckCircle className="h-5 w-5 text-green-400" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-400" />
              )}
            </div>
            <div className="ml-3">
              <h3 className={`text-sm font-medium ${
                result.success ? 'text-green-800' : 'text-red-800'
              }`}>
                Import {result.success ? 'Successful' : 'Failed'}
              </h3>
              <div className={`mt-2 text-sm ${
                result.success ? 'text-green-700' : 'text-red-700'
              }`}>
                <p>{result.message}</p>
                {result.imported > 0 && (
                  <p className="mt-1">Successfully imported {result.imported} records.</p>
                )}
              </div>
            </div>
          </div>

          {/* Error Details */}
          {result.errors.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-red-800 mb-2">Errors:</h4>
              <div className="max-h-60 overflow-y-auto">
                <table className="min-w-full divide-y divide-red-200">
                  <thead className="bg-red-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-red-500 uppercase tracking-wider">
                        Row
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-red-500 uppercase tracking-wider">
                        Field
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-red-500 uppercase tracking-wider">
                        Error
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-red-200">
                    {result.errors.map((error, index) => (
                      <tr key={index}>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-red-900">
                          {error.row}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-red-900">
                          {error.field}
                        </td>
                        <td className="px-3 py-2 text-sm text-red-900">
                          {error.message}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end">
        <button
          onClick={() => router.push('/buyers')}
          className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Back to Buyers
        </button>
      </div>
    </div>
  );
}

