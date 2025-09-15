import { describe, it, expect } from 'vitest';
import { insertBuyerSchema } from './db/schema';

describe('Buyer Validation', () => {
  it('should validate a complete buyer record', () => {
    const validBuyer = {
      fullName: 'John Doe',
      email: 'john@example.com',
      phone: '1234567890',
      city: 'Chandigarh',
      propertyType: 'Apartment',
      bhk: '2',
      purpose: 'Buy',
      budgetMin: 1000000,
      budgetMax: 2000000,
      timeline: '0-3m',
      source: 'Website',
      notes: 'Looking for a good apartment',
      tags: ['urgent', 'premium'],
    };

    const result = insertBuyerSchema.safeParse(validBuyer);
    expect(result.success).toBe(true);
  });

  it('should require BHK for Apartment property type', () => {
    const invalidBuyer = {
      fullName: 'John Doe',
      phone: '1234567890',
      city: 'Chandigarh',
      propertyType: 'Apartment',
      purpose: 'Buy',
      timeline: '0-3m',
      source: 'Website',
    };

    const result = insertBuyerSchema.safeParse(invalidBuyer);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors.some(err => err.path.includes('bhk'))).toBe(true);
    }
  });

  it('should not require BHK for Plot property type', () => {
    const validBuyer = {
      fullName: 'John Doe',
      phone: '1234567890',
      city: 'Chandigarh',
      propertyType: 'Plot',
      purpose: 'Buy',
      timeline: '0-3m',
      source: 'Website',
    };

    const result = insertBuyerSchema.safeParse(validBuyer);
    expect(result.success).toBe(true);
  });

  it('should validate budget constraints', () => {
    const invalidBuyer = {
      fullName: 'John Doe',
      phone: '1234567890',
      city: 'Chandigarh',
      propertyType: 'Apartment',
      bhk: '2',
      purpose: 'Buy',
      budgetMin: 2000000,
      budgetMax: 1000000, // Max less than min
      timeline: '0-3m',
      source: 'Website',
    };

    const result = insertBuyerSchema.safeParse(invalidBuyer);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors.some(err => err.path.includes('budgetMax'))).toBe(true);
    }
  });

  it('should validate phone number format', () => {
    const invalidBuyer = {
      fullName: 'John Doe',
      phone: '123', // Too short
      city: 'Chandigarh',
      propertyType: 'Apartment',
      bhk: '2',
      purpose: 'Buy',
      timeline: '0-3m',
      source: 'Website',
    };

    const result = insertBuyerSchema.safeParse(invalidBuyer);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors.some(err => err.path.includes('phone'))).toBe(true);
    }
  });

  it('should validate email format when provided', () => {
    const invalidBuyer = {
      fullName: 'John Doe',
      email: 'invalid-email',
      phone: '1234567890',
      city: 'Chandigarh',
      propertyType: 'Apartment',
      bhk: '2',
      purpose: 'Buy',
      timeline: '0-3m',
      source: 'Website',
    };

    const result = insertBuyerSchema.safeParse(invalidBuyer);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors.some(err => err.path.includes('email'))).toBe(true);
    }
  });

  it('should allow empty email', () => {
    const validBuyer = {
      fullName: 'John Doe',
      email: '',
      phone: '1234567890',
      city: 'Chandigarh',
      propertyType: 'Apartment',
      bhk: '2',
      purpose: 'Buy',
      timeline: '0-3m',
      source: 'Website',
    };

    const result = insertBuyerSchema.safeParse(validBuyer);
    expect(result.success).toBe(true);
  });
});

