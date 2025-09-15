import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db, buyers, buyerHistory, buyerFormSchema, insertBuyerSchema, users } from '@/lib/db';
import { eq, and, or, like, desc, asc, sql } from 'drizzle-orm';
import { rateLimit } from '@/lib/rateLimit';

export async function GET(request: NextRequest) {
  try {
    console.log('GET /api/buyers - Starting request');
    
    // Test database connection first
    try {
      await db.select().from(buyers).limit(1);
      console.log('Database connection OK');
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      return NextResponse.json({ 
        error: 'Database connection failed',
        details: dbError instanceof Error ? dbError.message : 'Unknown database error'
      }, { status: 500 });
    }
    
    const session = await getServerSession(authOptions);
    if (!session) {
      console.log('No session found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    console.log('Session found:', session.user?.email);

    const { searchParams } = new URL(request.url);
    console.log('All URL parameters:', Object.fromEntries(searchParams.entries()));
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = 10;
    const offset = (page - 1) * limit;

    // Build filters
    const conditions = [];
    
    // Search
    const search = searchParams.get('search');
    if (search) {
      conditions.push(
        or(
          like(buyers.fullName, `%${search}%`),
          like(buyers.phone, `%${search}%`),
          like(buyers.email, `%${search}%`)
        )
      );
    }

    // Valid enum values for filtering
    const validCities = ['Chandigarh', 'Mohali', 'Zirakpur', 'Panchkula', 'Other'];
    const validPropertyTypes = ['Apartment', 'Villa', 'Plot', 'Office', 'Retail'];
    const validStatuses = ['New', 'Qualified', 'Contacted', 'Visited', 'Negotiation', 'Converted', 'Dropped'];
    const validTimelines = ['0-3m', '3-6m', '>6m', 'Exploring'];

    // Filters with validation
    const city = searchParams.get('city');
    if (city && validCities.includes(city)) {
      conditions.push(eq(buyers.city, city as any));
    }

    const propertyType = searchParams.get('propertyType');
    if (propertyType && validPropertyTypes.includes(propertyType)) {
      conditions.push(eq(buyers.propertyType, propertyType as any));
    }

    const status = searchParams.get('status');
    if (status && validStatuses.includes(status)) {
      conditions.push(eq(buyers.status, status as any));
    }

    const timeline = searchParams.get('timeline');
    if (timeline && validTimelines.includes(timeline)) {
      conditions.push(eq(buyers.timeline, timeline as any));
    }

    // Sorting - default to updatedAt desc
    const orderBy = desc(buyers.updatedAt);

    console.log('Conditions:', conditions);
    console.log('Page:', page, 'Limit:', limit, 'Offset:', offset);

    // Get total count
    console.log('Getting total count...');
    let totalCountQuery = db.select({ count: sql<number>`count(*)` }).from(buyers);
    if (conditions.length > 0) {
      totalCountQuery = totalCountQuery.where(and(...conditions));
    }
    const totalCount = await totalCountQuery;
    console.log('Total count:', totalCount[0].count);

    // Get buyers
    console.log('Getting buyers list...');
    let buyersQuery = db.select().from(buyers);
    if (conditions.length > 0) {
      buyersQuery = buyersQuery.where(and(...conditions));
    }
    const buyersList = await buyersQuery
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset);
    console.log('Buyers list length:', buyersList.length);
    console.log('Buyers list data:', buyersList);

    const totalPages = Math.ceil((totalCount[0]?.count || 0) / limit);

    const response = {
      buyers: buyersList || [], // Ensure buyers is always an array
      currentPage: page,
      totalPages,
      totalCount: totalCount[0]?.count || 0,
    };
    
    console.log('Response:', response);
    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    
  } catch (error) {
    console.error('Error fetching buyers:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/buyers - Starting request');
    
    // Test database connection
    try {
      await db.select().from(users).limit(1);
      console.log('Database connection OK');
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      return NextResponse.json({ 
        error: 'Database connection failed',
        details: dbError instanceof Error ? dbError.message : 'Unknown database error'
      }, { status: 500 });
    }
    
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Session:', session);
    console.log('User email:', session.user?.email);
    
    // Always fetch user from database using email since session.user.id is not working
    const user = await db.query.users.findFirst({
      where: eq(users.email, session.user?.email!),
    });
    
    if (!user) {
      console.error('User not found in database for email:', session.user?.email);
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }
    
    const userId = user.id;
    console.log('Found user ID from database:', userId);

    // Rate limiting
    const rateLimitResult = rateLimit(`create:${userId}`, 5, 60000); // 5 requests per minute
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': '5',
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
          }
        }
      );
    }

    const body = await request.json();
    console.log('Request body:', body);
    
    // Validate the form data (without ownerId)
    const validatedFormData = buyerFormSchema.parse(body);
    console.log('Validated form data:', validatedFormData);
    
    // Add ownerId to create the full data for database insertion
    const validatedData = {
      ...validatedFormData,
      ownerId: userId,
    };
    console.log('Final validated data:', validatedData);
    
    // Create buyer
    const [newBuyer] = await db.insert(buyers).values(validatedData).returning();
    console.log('Created buyer:', newBuyer);

    // Create history entry
    await db.insert(buyerHistory).values({
      buyerId: newBuyer.id,
      changedBy: userId,
      diff: {
        created: { old: null, new: 'Lead created' }
      },
    });

    return NextResponse.json(newBuyer, { status: 201 });
  } catch (error) {
    console.error('Error creating buyer:', error);
    
    if (error instanceof Error) {
      if (error.name === 'ZodError') {
        return NextResponse.json({ 
          error: 'Validation error', 
          details: error.message 
        }, { status: 400 });
      }
      
      // Database constraint errors
      if (error.message.includes('foreign key constraint')) {
        return NextResponse.json({ 
          error: 'Database constraint error', 
          details: 'User not found or invalid reference' 
        }, { status: 400 });
      }
      
      return NextResponse.json({ 
        error: 'Server error', 
        details: error.message 
      }, { status: 500 });
    }
    
    return NextResponse.json({ 
      error: 'Unknown error occurred' 
    }, { status: 500 });
  }
}