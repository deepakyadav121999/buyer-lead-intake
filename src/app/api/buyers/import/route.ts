import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db, buyers, buyerHistory, insertBuyerSchema } from '@/lib/db';
import { parse } from 'csv-parser';
import { Readable } from 'stream';

interface ImportError {
  row: number;
  field: string;
  message: string;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Parse CSV
    const csvData: any[] = [];
    const errors: ImportError[] = [];
    
    const stream = Readable.from(await file.arrayBuffer());
    const buffer = Buffer.from(await file.arrayBuffer());
    const csvString = buffer.toString('utf-8');
    
    await new Promise((resolve, reject) => {
      Readable.from(csvString)
        .pipe(parse({ headers: true, skipEmptyLines: true }))
        .on('data', (row) => {
          csvData.push(row);
        })
        .on('end', resolve)
        .on('error', reject);
    });

    // Validate row count
    if (csvData.length > 200) {
      return NextResponse.json({
        success: false,
        imported: 0,
        errors: [{ row: 0, field: 'file', message: 'Maximum 200 rows allowed' }],
        message: 'File contains too many rows. Maximum 200 rows allowed.',
      });
    }

    // Validate and prepare data
    const validRows: any[] = [];
    
    csvData.forEach((row, index) => {
      const rowNumber = index + 2; // +2 because CSV is 1-indexed and we skip header
      
      try {
        // Convert string values to appropriate types
        const processedRow = {
          fullName: row.fullName?.trim(),
          email: row.email?.trim() || null,
          phone: row.phone?.trim(),
          city: row.city?.trim(),
          propertyType: row.propertyType?.trim(),
          bhk: row.bhk?.trim() || null,
          purpose: row.purpose?.trim(),
          budgetMin: row.budgetMin ? parseInt(row.budgetMin) : null,
          budgetMax: row.budgetMax ? parseInt(row.budgetMax) : null,
          timeline: row.timeline?.trim(),
          source: row.source?.trim(),
          notes: row.notes?.trim() || null,
          tags: row.tags ? row.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean) : [],
          status: row.status?.trim() || 'New',
        };

        // Validate using Zod schema
        const validatedData = insertBuyerSchema.parse(processedRow);
        validRows.push(validatedData);
      } catch (error: any) {
        if (error.name === 'ZodError') {
          error.errors.forEach((err: any) => {
            errors.push({
              row: rowNumber,
              field: err.path.join('.'),
              message: err.message,
            });
          });
        } else {
          errors.push({
            row: rowNumber,
            field: 'general',
            message: 'Invalid data format',
          });
        }
      }
    });

    // If there are validation errors, return them
    if (errors.length > 0) {
      return NextResponse.json({
        success: false,
        imported: 0,
        errors,
        message: `Validation failed for ${errors.length} row(s)`,
      });
    }

    // Import valid rows in a transaction
    let importedCount = 0;
    
    try {
      for (const rowData of validRows) {
        // Create buyer
        const [newBuyer] = await db.insert(buyers).values({
          ...rowData,
          ownerId: session.user.id,
        }).returning();

        // Create history entry
        await db.insert(buyerHistory).values({
          buyerId: newBuyer.id,
          changedBy: session.user.id,
          diff: {
            imported: { old: null, new: 'Imported from CSV' }
          },
        });

        importedCount++;
      }

      return NextResponse.json({
        success: true,
        imported: importedCount,
        errors: [],
        message: `Successfully imported ${importedCount} buyer lead(s)`,
      });
    } catch (error) {
      console.error('Database error during import:', error);
      return NextResponse.json({
        success: false,
        imported: 0,
        errors: [{ row: 0, field: 'database', message: 'Database error during import' }],
        message: 'An error occurred while importing data',
      });
    }
  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json({
      success: false,
      imported: 0,
      errors: [{ row: 0, field: 'file', message: 'Error processing CSV file' }],
      message: 'An error occurred while processing the file',
    });
  }
}

