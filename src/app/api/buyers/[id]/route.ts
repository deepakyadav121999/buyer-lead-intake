import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db, buyers, buyerHistory, insertBuyerSchema } from '@/lib/db';
import { eq, and } from 'drizzle-orm';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { updatedAt, ...updateData } = body;

    // Validate the data
    const validatedData = insertBuyerSchema.parse(updateData);

    // Get current buyer to check ownership and concurrency
    const currentBuyer = await db.query.buyers.findFirst({
      where: eq(buyers.id, params.id),
    });

    if (!currentBuyer) {
      return NextResponse.json({ error: 'Buyer not found' }, { status: 404 });
    }

    // Check ownership
    if (currentBuyer.ownerId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Check concurrency
    if (updatedAt && new Date(currentBuyer.updatedAt).getTime() !== new Date(updatedAt).getTime()) {
      return NextResponse.json({ error: 'Concurrency conflict' }, { status: 409 });
    }

    // Calculate changes for history
    const changes: Record<string, { old: any; new: any }> = {};
    Object.keys(validatedData).forEach(key => {
      const oldValue = currentBuyer[key as keyof typeof currentBuyer];
      const newValue = validatedData[key as keyof typeof validatedData];
      if (oldValue !== newValue) {
        changes[key] = { old: oldValue, new: newValue };
      }
    });

    // Update buyer
    const [updatedBuyer] = await db
      .update(buyers)
      .set({
        ...validatedData,
        updatedAt: new Date(),
      })
      .where(eq(buyers.id, params.id))
      .returning();

    // Create history entry if there are changes
    if (Object.keys(changes).length > 0) {
      await db.insert(buyerHistory).values({
        buyerId: params.id,
        changedBy: session.user.id,
        diff: changes,
      });
    }

    return NextResponse.json(updatedBuyer);
  } catch (error) {
    console.error('Error updating buyer:', error);
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation error', details: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current buyer to check ownership
    const currentBuyer = await db.query.buyers.findFirst({
      where: eq(buyers.id, params.id),
    });

    if (!currentBuyer) {
      return NextResponse.json({ error: 'Buyer not found' }, { status: 404 });
    }

    // Check ownership
    if (currentBuyer.ownerId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Delete buyer (history will be cascade deleted if foreign key is set up)
    await db.delete(buyers).where(eq(buyers.id, params.id));

    return NextResponse.json({ message: 'Buyer deleted successfully' });
  } catch (error) {
    console.error('Error deleting buyer:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

