# Buyer Lead Intake App

A comprehensive Next.js application for managing buyer leads with advanced features including CSV import/export, real-time validation, and user authentication.

## 🚀 Features

### Core Functionality
- **Lead Management**: Create, view, edit, and delete buyer leads
- **Advanced Search & Filtering**: Search by name, phone, email with filters for city, property type, status, and timeline
- **Real-time Pagination**: Server-side pagination with URL-synced state
- **CSV Import/Export**: Bulk import with validation and filtered export
- **User Authentication**: Demo login system with session management
- **Ownership Control**: Users can only edit their own leads
- **Change History**: Track all modifications with user attribution
- **Concurrency Control**: Prevent conflicts during simultaneous edits

### Technical Features
- **TypeScript**: Full type safety throughout the application
- **Server-Side Rendering**: Optimized performance with SSR
- **Database Migrations**: Proper schema management with Drizzle ORM
- **Input Validation**: Client and server-side validation with Zod
- **Rate Limiting**: Protection against abuse
- **Error Boundaries**: Graceful error handling
- **Accessibility**: WCAG compliant forms and navigation
- **Responsive Design**: Mobile-first approach with Tailwind CSS

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, NextAuth.js
- **Database**: PostgreSQL with Drizzle ORM
- **Validation**: Zod schemas
- **Testing**: Vitest
- **Authentication**: NextAuth.js with credentials provider

## 📋 Data Model

### Buyers Table
```typescript
{
  id: string (UUID)
  fullName: string (2-80 chars)
  email: string (optional, validated)
  phone: string (10-15 digits, required)
  city: enum ['Chandigarh', 'Mohali', 'Zirakpur', 'Panchkula', 'Other']
  propertyType: enum ['Apartment', 'Villa', 'Plot', 'Office', 'Retail']
  bhk: enum ['1', '2', '3', '4', 'Studio'] (required for Apartment/Villa)
  purpose: enum ['Buy', 'Rent']
  budgetMin: number (optional, INR)
  budgetMax: number (optional, must be >= budgetMin)
  timeline: enum ['0-3m', '3-6m', '>6m', 'Exploring']
  source: enum ['Website', 'Referral', 'Walk-in', 'Call', 'Other']
  status: enum ['New', 'Qualified', 'Contacted', 'Visited', 'Negotiation', 'Converted', 'Dropped']
  notes: string (optional, max 1000 chars)
  tags: string[] (optional)
  ownerId: string (user reference)
  createdAt: timestamp
  updatedAt: timestamp
}
```

### Buyer History Table
```typescript
{
  id: string (UUID)
  buyerId: string (buyer reference)
  changedBy: string (user reference)
  changedAt: timestamp
  diff: JSON (field changes: { field: { old: value, new: value } })
}
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd buyer-lead-intake
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp env.example .env.local
   ```
   
   Update `.env.local` with your configuration:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/buyer_leads"
   NEXTAUTH_SECRET="your-secret-key-here"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. **Database Setup**
   ```bash
   # Generate migration files
   npm run db:generate
   
   # Apply migrations
   npm run db:migrate
   
   # Or push schema directly (for development)
   npm run db:push
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

6. **Access the Application**
   - Open [http://localhost:3000](http://localhost:3000)
   - Sign in with any email and name (demo authentication)

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   └── buyers/        # Buyer CRUD operations
│   ├── auth/              # Authentication pages
│   ├── buyers/            # Buyer management pages
│   └── layout.tsx         # Root layout
├── components/            # Reusable components
│   ├── BuyerDetail.tsx    # Individual buyer view/edit
│   ├── BuyerForm.tsx      # Lead creation/editing form
│   ├── BuyersList.tsx     # List with search/filters
│   ├── CSVImport.tsx      # CSV import interface
│   ├── ErrorBoundary.tsx  # Error handling
│   ├── Navigation.tsx     # Main navigation
│   └── SessionProvider.tsx # Auth context
├── lib/                   # Utilities and configuration
│   ├── auth.ts           # NextAuth configuration
│   ├── db/               # Database schema and connection
│   │   ├── index.ts      # Database connection
│   │   └── schema.ts     # Drizzle schema definitions
│   ├── rateLimit.ts      # Rate limiting utility
│   └── validation.test.ts # Unit tests
└── styles/               # Global styles
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/signin` - User authentication
- `GET /api/auth/session` - Get current session

### Buyers
- `GET /api/buyers` - List buyers with pagination and filters
- `POST /api/buyers` - Create new buyer lead
- `PUT /api/buyers/[id]` - Update buyer lead
- `DELETE /api/buyers/[id]` - Delete buyer lead
- `POST /api/buyers/import` - Import CSV file
- `GET /api/buyers/export` - Export filtered data as CSV

### Query Parameters (GET /api/buyers)
- `page` - Page number (default: 1)
- `search` - Search term (name, phone, email)
- `city` - Filter by city
- `propertyType` - Filter by property type
- `status` - Filter by status
- `timeline` - Filter by timeline
- `sortBy` - Sort field (default: updatedAt)
- `sortOrder` - Sort direction (asc/desc, default: desc)

## 🧪 Testing

Run the test suite:
```bash
# Run tests
npm test

# Run tests with UI
npm test:ui
```

The test suite includes:
- Validation schema tests
- Budget constraint validation
- Required field validation
- Email format validation
- Phone number format validation

## 📊 CSV Import/Export

### Import Format
CSV files should include these headers:
```
fullName,email,phone,city,propertyType,bhk,purpose,budgetMin,budgetMax,timeline,source,notes,tags,status
```

### Import Rules
- Maximum 200 rows per import
- Required fields: fullName, phone, city, propertyType, purpose, timeline, source
- BHK required for Apartment and Villa property types
- Valid enum values must be used
- Budget max must be >= budget min
- Phone must be 10-15 digits
- Email must be valid format (if provided)

### Export Features
- Exports current filtered results
- Includes all fields plus timestamps
- Respects current search and filter state
- Generates timestamped filename

## 🔒 Security Features

### Authentication & Authorization
- Session-based authentication with NextAuth.js
- Users can only edit their own leads
- Protected API routes with session validation

### Rate Limiting
- 5 create/update requests per minute per user
- 10 read requests per minute per user
- IP-based rate limiting for anonymous requests

### Input Validation
- Client-side validation with immediate feedback
- Server-side validation with Zod schemas
- SQL injection protection via Drizzle ORM
- XSS protection with React's built-in escaping

### Concurrency Control
- Optimistic locking with updatedAt timestamps
- Conflict detection and user-friendly error messages
- Automatic refresh suggestions on conflicts

## 🎨 UI/UX Features

### Responsive Design
- Mobile-first approach
- Responsive tables with horizontal scroll
- Touch-friendly interface elements
- Optimized for all screen sizes

### Accessibility
- WCAG 2.1 AA compliant
- Proper ARIA labels and roles
- Keyboard navigation support
- Screen reader friendly
- High contrast color schemes
- Focus indicators

### User Experience
- Real-time search with debouncing
- URL-synced filters and pagination
- Loading states and error boundaries
- Optimistic updates with rollback
- Clear error messages and validation feedback

## 🚀 Deployment

### Environment Variables
```env
DATABASE_URL="postgresql://user:pass@host:port/db"
NEXTAUTH_SECRET="your-production-secret"
NEXTAUTH_URL="https://your-domain.com"
```

### Build Commands
```bash
# Build for production
npm run build

# Start production server
npm start
```

### Database Migration
```bash
# Generate migrations
npm run db:generate

# Apply migrations
npm run db:migrate
```

## 🔧 Development Notes

### Validation Strategy
- **Client-side**: Immediate feedback with React Hook Form + Zod
- **Server-side**: Comprehensive validation before database operations
- **Database**: Constraints and types enforced at schema level

### SSR vs Client-side
- **SSR**: Initial page loads, SEO optimization
- **Client-side**: Interactive features, real-time updates
- **Hybrid**: Best of both worlds with Next.js App Router

### Ownership Enforcement
- Database-level foreign key constraints
- API route authorization checks
- UI-level permission filtering
- Session-based user identification

## 📈 Performance Optimizations

- Server-side pagination (10 items per page)
- Database indexing on searchable fields
- Debounced search (500ms delay)
- Optimistic UI updates
- Efficient database queries with Drizzle ORM
- Image optimization with Next.js
- CSS optimization with Tailwind

## 🐛 Error Handling

- Global error boundary for React errors
- API error responses with proper HTTP status codes
- Validation error messages with field-specific feedback
- Graceful fallbacks for network failures
- Development error details in console

## 📝 What's Implemented vs Skipped

### ✅ Fully Implemented
- Complete CRUD operations for buyers
- Advanced search and filtering with URL sync
- Real pagination and sorting
- CSV import with validation and error reporting
- CSV export respecting current filters
- User authentication and ownership
- Change history tracking
- Concurrency control
- Rate limiting
- Input validation (client + server)
- Error boundaries and accessibility
- Unit tests for validation
- Responsive design
- TypeScript throughout

### 🚧 Nice-to-haves (Not Implemented)
- Tag chips with typeahead (basic tag input implemented)
- Status quick-actions in table (full edit form available)
- Full-text search on notes (basic search implemented)
- File upload for attachments
- Advanced admin dashboard
- Email notifications
- Real-time updates with WebSockets

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
1. Check the documentation above
2. Review the test cases for usage examples
3. Check the API endpoint documentation
4. Create an issue with detailed information

---

**Built with ❤️ using Next.js, TypeScript, and modern web technologies.**