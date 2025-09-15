import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { BuyerForm } from '@/components/BuyerForm';
import { Navigation } from '@/components/Navigation';

export default async function NewBuyerPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/auth/signin');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Create New Lead</h1>
            <p className="mt-1 text-sm text-gray-600">
              Add a new buyer lead to your system
            </p>
          </div>
          
          <BuyerForm />
        </div>
      </div>
    </div>
  );
}

