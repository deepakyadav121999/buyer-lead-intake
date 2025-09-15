# 🏠 Buyer Lead Intake App

Hey there! 👋 This is a modern web app for managing property buyer leads. Think of it as a mini-CRM where you can add potential buyers, track their preferences, and manage your leads efficiently.

## What does this app do?

- **Add new leads**: Capture buyer information like name, phone, budget, property preferences
- **Manage leads**: View all your leads in a beautiful table, search and filter them
- **Import/Export**: Upload leads from CSV files or export your data
- **Track changes**: See who changed what and when
- **Stay organized**: Everything is responsive and works great on mobile too!

## 🚀 Quick Start (Get it running in 5 minutes!)

### Step 1: Get the code
   ```bash
git clone <your-repo-url>
   cd buyer-lead-intake
   ```

### Step 2: Install dependencies
   ```bash
   npm install
   ```

### Step 3: Set up your environment
Create a `.env.local` file in the root folder and add these:

   ```bash
# Database - You'll need a PostgreSQL database
DATABASE_URL="postgresql://username:password@localhost:5432/buyer_leads"

# Authentication secrets - Generate a random string for security
NEXTAUTH_SECRET="your-super-secret-key-here"
   NEXTAUTH_URL="http://localhost:3000"
   ```

**Need help with the database?** 
- Install PostgreSQL locally, OR
- Use a free service like [Supabase](https://supabase.com/) or [Neon](https://neon.tech/)
- Create a database called `buyer_leads`

**How to generate NEXTAUTH_SECRET:**
```bash
# Run this in your terminal to generate a secure key
openssl rand -base64 32
```

### Step 4: Set up the database
   ```bash
   # Generate migration files
   npm run db:generate
   
# Apply migrations to create tables
   npm run db:push
   ```

### Step 5: Start the app
   ```bash
   npm run dev
   ```

Visit `http://localhost:3000` and you're ready to go! 🎉

## 🔑 How to log in

This is a demo app, so login is super simple:
- **Email**: `demo@example.com` 
- **Password**: `demo123`

Or use any email/password combo - it's just for testing!

## 📱 How to use the app

### Adding a new lead
1. Click "New Lead" button
2. Fill out the form (name and phone are required)
3. Set their budget, property preferences, timeline
4. Add notes or tags if needed
5. Hit "Create Lead" - done!

### Managing your leads
- **Search**: Type in the search box to find leads by name, phone, or email
- **Filter**: Use the dropdowns to filter by city, property type, status, etc.
- **Edit**: Click "View/Edit" on any lead to update their info
- **Export**: Click "Export CSV" to download your current filtered results

### Importing leads from CSV
1. Go to "Import CSV" from the navigation
2. Download the template to see the required format
3. Upload your CSV file (max 200 rows)
4. Fix any validation errors shown
5. Import successful rows

## 🛠️ For Developers

### Project Structure
```
src/
├── app/                 # Next.js app router pages
├── components/          # React components
├── lib/                 # Utilities, database, auth
└── styles/             # CSS files
```

### Key Technologies
- **Next.js 15**: React framework with app router
- **TypeScript**: For type safety
- **PostgreSQL + Drizzle**: Database and ORM
- **NextAuth.js**: Authentication
- **Tailwind CSS**: Styling
- **Zod**: Data validation

### Running tests
```bash
npm test
```

### Available scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run linting
npm test            # Run tests
npm run db:generate # Generate database migrations
npm run db:push     # Apply migrations to database
```

## 🐛 Common Issues & Solutions

### "Database connection failed"
- Make sure PostgreSQL is running
- Check your `DATABASE_URL` in `.env.local`
- Ensure the database exists

### "Sign in failed"
- Check that `NEXTAUTH_SECRET` is set in `.env.local`
- Make sure `NEXTAUTH_URL` matches your local URL

### "No leads showing up"
- Try refreshing the page (Ctrl+F5)
- Check browser console for errors
- Ensure you're logged in

### Import CSV errors
- Download the template to see the correct format
- Required fields: fullName, phone, city, propertyType, purpose, timeline, source
- BHK is required for Apartments and Villas
- Phone should be 10-15 digits
- Budget max should be >= budget min

## 🎨 What makes this special?

- **Beautiful UI**: Modern, responsive design that works great on mobile
- **Smart validation**: Catches errors before you submit
- **Real-time search**: Find leads as you type
- **Bulk operations**: Import hundreds of leads at once
- **Change tracking**: See what changed and when
- **Secure**: Your leads are protected and only you can edit them

## 📊 Database Schema

The app uses two main tables:

**buyers** - Stores all lead information
**buyer_history** - Tracks changes to leads

All the boring technical details are handled automatically - you just need to focus on managing your leads!

## 🤝 Need Help?

If you run into any issues:
1. Check this README first
2. Look at the browser console for error messages
3. Make sure your `.env.local` file is set up correctly
4. Try restarting the development server

## 🚀 Deployment

Ready to deploy? The app works great on:
- **Vercel** (recommended - made by the Next.js team)
- **Netlify** 
- **Railway**
- Any platform that supports Next.js

Just make sure to set your environment variables in your deployment platform!

---

**Built with ❤️ for managing property leads efficiently!**

*This is a demo application showcasing modern web development practices with Next.js, TypeScript, and PostgreSQL.*