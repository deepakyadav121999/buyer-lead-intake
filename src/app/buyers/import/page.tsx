import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { CSVImport } from '@/components/CSVImport';
import { Navigation } from '@/components/Navigation';

export default async function ImportPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/auth/signin');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Import CSV</h1>
            <p className="mt-1 text-sm text-gray-600">
              Import buyer leads from a CSV file
            </p>
          </div>
          
          <CSVImport />
        </div>
      </div>
    </div>
  );
}

