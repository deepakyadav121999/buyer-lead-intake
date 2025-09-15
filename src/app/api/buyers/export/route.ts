import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db, buyers } from '@/lib/db';
import { eq, and, or, like, desc, asc } from 'drizzle-orm';
import { stringify } from 'csv-stringify';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);

    // Build filters (same as GET /api/buyers)
    const conditions = [];
    
    // Search
    const search = searchParams.get('search');
    if (search) {
      conditions.push(
        or(
          like(buyers.fullName, `%${search}%`),
          like(buyers.phone, `%${search}%`),
          like(buyers.email, `%${search}%`)
        )!
      );
    }

    // Filters
    const city = searchParams.get('city');
    if (city) {
      conditions.push(eq(buyers.city, city as any));
    }

    const propertyType = searchParams.get('propertyType');
    if (propertyType) {
      conditions.push(eq(buyers.propertyType, propertyType as any));
    }

    const status = searchParams.get('status');
    if (status) {
      conditions.push(eq(buyers.status, status as any));
    }

    const timeline = searchParams.get('timeline');
    if (timeline) {
      conditions.push(eq(buyers.timeline, timeline as any));
    }

    // Sorting
    const sortBy = searchParams.get('sortBy') || 'updatedAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const orderBy = sortOrder === 'asc' ? asc(buyers[sortBy as keyof typeof buyers]) : desc(buyers[sortBy as keyof typeof buyers]);

    // Get all buyers matching filters
    const buyersList = await db
      .select()
      .from(buyers)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(orderBy);

    // Convert to CSV format
    const csvData = buyersList.map(buyer => ({
      fullName: buyer.fullName,
      email: buyer.email || '',
      phone: buyer.phone,
      city: buyer.city,
      propertyType: buyer.propertyType,
      bhk: buyer.bhk || '',
      purpose: buyer.purpose,
      budgetMin: buyer.budgetMin || '',
      budgetMax: buyer.budgetMax || '',
      timeline: buyer.timeline,
      source: buyer.source,
      status: buyer.status,
      notes: buyer.notes || '',
      tags: buyer.tags ? buyer.tags.join(',') : '',
      createdAt: buyer.createdAt.toISOString(),
      updatedAt: buyer.updatedAt.toISOString(),
    }));

    // Generate CSV
    const csvString = await new Promise<string>((resolve, reject) => {
      stringify(csvData, {
        header: true,
        columns: [
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
          'status',
          'notes',
          'tags',
          'createdAt',
          'updatedAt',
        ],
      }, (err, output) => {
        if (err) reject(err);
        else resolve(output);
      });
    });

    // Return CSV file
    return new NextResponse(csvString, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="buyers-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

