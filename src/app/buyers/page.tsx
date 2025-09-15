import { Suspense } from 'react';
import { BuyersList } from '@/components/BuyersList';
import { Navigation } from '@/components/Navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

interface SearchParams {
  page?: string;
  search?: string;
  city?: string;
  propertyType?: string;
  status?: string;
  timeline?: string;
  sortBy?: string;
  sortOrder?: string;
}

interface PageProps {
  searchParams: SearchParams;
}

export default async function BuyersPage({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/auth/signin');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Buyer Leads</h1>
            <p className="mt-1 text-sm text-gray-600">
              Manage and track your buyer leads
            </p>
          </div>
          
          <Suspense fallback={<div>Loading...</div>}>
            <BuyersList searchParams={searchParams} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

