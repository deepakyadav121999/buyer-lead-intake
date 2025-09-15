import { pgTable, uuid, varchar, text, integer, timestamp, jsonb, pgEnum } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

// Enums
export const cityEnum = pgEnum('city', ['Chandigarh', 'Mohali', 'Zirakpur', 'Panchkula', 'Other']);
export const propertyTypeEnum = pgEnum('property_type', ['Apartment', 'Villa', 'Plot', 'Office', 'Retail']);
export const bhkEnum = pgEnum('bhk', ['1', '2', '3', '4', 'Studio']);
export const purposeEnum = pgEnum('purpose', ['Buy', 'Rent']);
export const timelineEnum = pgEnum('timeline', ['0-3m', '3-6m', '>6m', 'Exploring']);
export const sourceEnum = pgEnum('source', ['Website', 'Referral', 'Walk-in', 'Call', 'Other']);
export const statusEnum = pgEnum('status', ['New', 'Qualified', 'Contacted', 'Visited', 'Negotiation', 'Converted', 'Dropped']);

// Users table (for authentication)
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Buyers table
export const buyers = pgTable('buyers', {
  id: uuid('id').primaryKey().defaultRandom(),
  fullName: varchar('full_name', { length: 80 }).notNull(),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 15 }).notNull(),
  city: cityEnum('city').notNull(),
  propertyType: propertyTypeEnum('property_type').notNull(),
  bhk: bhkEnum('bhk'),
  purpose: purposeEnum('purpose').notNull(),
  budgetMin: integer('budget_min'),
  budgetMax: integer('budget_max'),
  timeline: timelineEnum('timeline').notNull(),
  source: sourceEnum('source').notNull(),
  status: statusEnum('status').default('New').notNull(),
  notes: text('notes'),
  tags: jsonb('tags').$type<string[]>(),
  ownerId: uuid('owner_id').references(() => users.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Buyer history table
export const buyerHistory = pgTable('buyer_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  buyerId: uuid('buyer_id').references(() => buyers.id).notNull(),
  changedBy: uuid('changed_by').references(() => users.id).notNull(),
  changedAt: timestamp('changed_at').defaultNow().notNull(),
  diff: jsonb('diff').$type<Record<string, { old: any; new: any }>>().notNull(),
});

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);

// Client-side form validation schema (without ownerId)
export const buyerFormSchema = z.object({
  fullName: z.string().min(2).max(80),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().regex(/^\d{10,15}$/, 'Phone must be 10-15 digits'),
  city: z.enum(['Chandigarh', 'Mohali', 'Zirakpur', 'Panchkula', 'Other']),
  propertyType: z.enum(['Apartment', 'Villa', 'Plot', 'Office', 'Retail']),
  bhk: z.enum(['1', '2', '3', '4', 'Studio']).optional(),
  purpose: z.enum(['Buy', 'Rent']),
  budgetMin: z.number().int().positive().optional(),
  budgetMax: z.number().int().positive().optional(),
  timeline: z.enum(['0-3m', '3-6m', '>6m', 'Exploring']),
  source: z.enum(['Website', 'Referral', 'Walk-in', 'Call', 'Other']),
  notes: z.string().max(1000).optional(),
  tags: z.array(z.string()).optional(),
}).refine((data) => {
  // BHK required for Apartment/Villa
  if (['Apartment', 'Villa'].includes(data.propertyType) && !data.bhk) {
    return false;
  }
  return true;
}, {
  message: 'BHK is required for Apartment and Villa property types',
  path: ['bhk'],
}).refine((data) => {
  // Budget validation
  if (data.budgetMin && data.budgetMax && data.budgetMax < data.budgetMin) {
    return false;
  }
  return true;
}, {
  message: 'Budget max must be greater than or equal to budget min',
  path: ['budgetMax'],
});

// Server-side insert schema (with ownerId) - recreate without refinements
export const insertBuyerSchema = z.object({
  fullName: z.string().min(2).max(80),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().regex(/^\d{10,15}$/, 'Phone must be 10-15 digits'),
  city: z.enum(['Chandigarh', 'Mohali', 'Zirakpur', 'Panchkula', 'Other']),
  propertyType: z.enum(['Apartment', 'Villa', 'Plot', 'Office', 'Retail']),
  bhk: z.enum(['1', '2', '3', '4', 'Studio']).optional(),
  purpose: z.enum(['Buy', 'Rent']),
  budgetMin: z.number().int().positive().optional(),
  budgetMax: z.number().int().positive().optional(),
  timeline: z.enum(['0-3m', '3-6m', '>6m', 'Exploring']),
  source: z.enum(['Website', 'Referral', 'Walk-in', 'Call', 'Other']),
  notes: z.string().max(1000).optional(),
  tags: z.array(z.string()).optional(),
  ownerId: z.string().uuid(),
}).refine((data) => {
  // BHK required for Apartment/Villa
  if (['Apartment', 'Villa'].includes(data.propertyType) && !data.bhk) {
    return false;
  }
  return true;
}, {
  message: 'BHK is required for Apartment and Villa property types',
  path: ['bhk'],
}).refine((data) => {
  // Budget validation
  if (data.budgetMin && data.budgetMax && data.budgetMax < data.budgetMin) {
    return false;
  }
  return true;
}, {
  message: 'Budget max must be greater than or equal to budget min',
  path: ['budgetMax'],
});

export const selectBuyerSchema = createSelectSchema(buyers);

export const insertBuyerHistorySchema = createInsertSchema(buyerHistory);
export const selectBuyerHistorySchema = createSelectSchema(buyerHistory);

// Types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Buyer = typeof buyers.$inferSelect;
export type NewBuyer = typeof buyers.$inferInsert;
export type BuyerHistory = typeof buyerHistory.$inferSelect;
export type NewBuyerHistory = typeof buyerHistory.$inferInsert;

