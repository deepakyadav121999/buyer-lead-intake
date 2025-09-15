import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { BuyerDetail } from '@/components/BuyerDetail';
import { Navigation } from '@/components/Navigation';
import { db, buyers, buyerHistory, users } from '@/lib/db';
import { eq, desc } from 'drizzle-orm';

interface PageProps {
  params: {
    id: string;
  };
}

export default async function BuyerDetailPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/auth/signin');
  }

  // Fetch buyer data
  const [buyer] = await db
    .select()
    .from(buyers)
    .where(eq(buyers.id, params.id))
    .limit(1);

  if (!buyer) {
    redirect('/buyers');
  }

  // Check ownership - get user from database
  const user = await db
    .select()
    .from(users)
    .where(eq(users.email, session.user?.email!))
    .limit(1);
  
  if (!user[0] || buyer.ownerId !== user[0].id) {
    redirect('/buyers');
  }

  // Fetch buyer history (simplified without relations)
  const history = await db
    .select()
    .from(buyerHistory)
    .where(eq(buyerHistory.buyerId, params.id))
    .orderBy(desc(buyerHistory.changedAt))
    .limit(5);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <BuyerDetail buyer={buyer} history={history} />
        </div>
      </div>
    </div>
  );
}

